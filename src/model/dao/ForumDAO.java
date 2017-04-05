package model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import controller.util.ParamProcessor;
import model.Forum;
import model.User;
import model.dao.util.Connector;
import model.dao.util.QueryBuilder;

public class ForumDAO {
	
	static final String TABLE_NAME = "FORUM";
	static String[] tables = {"obj.id", "obj.date", "obj.title", "usr.username"};
	
	static final String COUNT_QUERY_START = 
			"SELECT COUNT(obj.ID) FROM FORUM obj";
	static final String FETCH_QUERY_START = 
			" SELECT obj.*, usr.username, frm.title FROM FORUM obj";
			
	static final String JOIN_STRING = 
		    " LEFT JOIN USER usr " +
			" ON obj.owner = usr.id " +
			" LEFT JOIN FORUM frm " +
			" ON obj.parent = frm.id ";
	
	// --------------------------------------------------------------------------------------------
	// Processing

	private Forum process(ResultSet rs) throws Exception {
		Forum f =  new Forum (
			rs.getInt("id"),
			rs.getString("title"),
			rs.getString("descript"),
			rs.getInt("parent"),
			rs.getInt("owner"),
			rs.getInt("vistype"),
			rs.getTimestamp("date"),
			rs.getBoolean("locked"),
			rs.getBoolean("deleted"),
			rs.getString("usr.username"),
			rs.getString("frm.title")
		);

		return f;
	}

	private void processFilter(QueryBuilder qb, ParamProcessor pp, User user) {
		if (user.getRole() < User.Role.ADMIN) {
			qb
			.and("obj.title LIKE $title")
			.and("obj.parent = $parent")
			.and("usr.username LIKE $ownerUsername")
			.and("obj.owner = $owner")
			.and("obj.vistype <= $vistype")
			.and("obj.vistype <= " + user.getPermissionLevel())
			.and("obj.date <= $dataA")
			.and("obj.date >= $dataB")
			.and("obj.locked <= $includeLocked")
			.and("obj.deleted = FALSE")
			.orderBy("obj.id", "asc")
			.orderBy("$orderBy", "$asc", tables)
			.orderBy("obj.id", "asc");
		} else {
			qb
			.and("obj.title LIKE $title")
			.and("obj.parent = $parent")
			.and("usr.username LIKE $ownerUsername")
			.and("obj.owner = $owner")
			.and("obj.vistype <= $vistype")
			.and("obj.date <= $dataA")
			.and("obj.date >= $dataB")
			.and("obj.locked <= $includeLocked")
			.and("obj.deleted <= $includeDeleted")
			.orderBy("obj.deleted", "asc")
			.orderBy("$orderBy", "$asc", tables)
			.orderBy("obj.id", "asc");
		}
	}

	// --------------------------------------------------------------------------------------------
	// Getters
	
	public ArrayList<Object> filter(ParamProcessor pp, User user)
	{
		ArrayList<Object> list = new ArrayList<Object>();
		QueryBuilder qb = new QueryBuilder(pp);
		
		Boolean showDescendants = pp.bool("showDescendants");
		Integer ancestorId = null;
		
		// Let's see if we're searching through ancestry and not parenthood
		if (showDescendants != null && showDescendants) {
			ancestorId = pp.integer("parent");
			pp.remove("parent");
		}
		
		// Create part of the query that deals with filters
		processFilter(qb, pp, user);
		qb.setJoin("LEFT JOIN USER usr "
				+  "ON obj.owner = usr.id "
				+  "LEFT JOIN FORUM frm "
				+  "ON obj.parent = frm.id ");
		
		if (ancestorId == null) {
			qb.setStart(COUNT_QUERY_START);
			list.add(qb.getNumRecords());
		} else {
			list.add(0);
		}

		//pp.printDebug();
		
		qb.setStart(FETCH_QUERY_START);
		qb.limit("$page", "$perPage");
		
		list.add(processMany(qb));
		
		// Let's see if parent is the descendant
		if (ancestorId != null) {
			@SuppressWarnings("unchecked")
			ArrayList<Object> objs = (ArrayList<Object>) list.get(1);
			Forum ancestor = new ForumDAO().findById(ancestorId, user);
			
			for (int i=0; i<objs.size(); i++) {
				if (!((Forum) objs.get(i)).isChildOf(ancestor)) {
					objs.remove(i);
				}
			}
			list.set(0, objs.size());
		}
		
		return list;
	}

	public Forum findById(int id, User user) {
		boolean adminAccess = (user == null) ? true : user.getRole() == User.Role.ADMIN; 
		try (Connection conn = Connector.get();
				PreparedStatement stmt = conn.prepareStatement(
				    FETCH_QUERY_START + JOIN_STRING + " WHERE obj.id=? AND obj.deleted <= ?;");) {
			stmt.setObject(1, id);
			stmt.setObject(2, adminAccess);
			return processOne(stmt);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	public Forum findById(int id) {
		return findById(id, null);
	}
	
	// --------------------------------------------------------------------------------------------
	// SPECIAL OPERATIONS
	
	public int lock(Forum o, Boolean doLock) {
		o.setLocked(doLock);
		propagate(o, "locked", "locked < ?", o.getLocked());
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("UPDATE " + TABLE_NAME + " SET locked=? WHERE id=?;");
			stmt.setObject(1, doLock);
			stmt.setObject(2, o.getId());
			return stmt.executeUpdate();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		return 0;
	}
	
	// --------------------------------------------------------------------------------------------
	// Standard Operations
	
	private void propagate(Forum o, String column, String when, Object val) {
		
		try (Connection conn = Connector.get();) {
				
			PreparedStatement stmt;
			
			// Select all children
			stmt = conn.prepareStatement(
					"SELECT * FROM " + TABLE_NAME + " WHERE " + when + " AND parent = ?;");
			stmt.setObject(1, val);
			stmt.setObject(2, o.getId());
			stmt.execute();
			ResultSet rs = stmt.getResultSet();
			if (rs != null) {
				ArrayList<Object> list = processMany(rs);
				for (Object ob : list) {

					new ForumDAO().propagate((Forum) ob, column, when, val);
				}
			}
			
			// Update all children
			stmt = conn.prepareStatement(
					"UPDATE " + TABLE_NAME + " SET " + column + "=? WHERE " + when + " AND parent = ?;");
			stmt.setObject(1, val);
			stmt.setObject(2, val);
			stmt.setObject(3, o.getId());
			stmt.execute();
			
		}
		catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public boolean insert(Forum o)
	{
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("INSERT INTO FORUM "
			+ "(title, descript, parent, owner, vistype, locked) VALUES (?,?,?,?,?,?);");
			stmt.setObject(1, o.getTitle());
			stmt.setObject(2, o.getDescript());
			stmt.setObject(3, o.getParent());
			stmt.setObject(4, o.getOwner());
			stmt.setObject(5, o.getVistype());
			stmt.setObject(6, o.getLocked());
			return stmt.execute();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		return false;
	}

	public int update(Forum o)
	{
		propagate(o, "vistype", "vistype < ?", o.getVistype());
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("UPDATE FORUM SET title=?, descript=?, parent=?, owner=?, vistype=?, locked=?, deleted=? WHERE id=?;");
			stmt.setObject(1, o.getTitle());
			stmt.setObject(2, o.getDescript());
			stmt.setObject(3, o.getParent());
			stmt.setObject(4, o.getOwner());
			stmt.setObject(5, o.getVistype());
			stmt.setObject(6, o.getLocked());
			stmt.setObject(7, o.getDeleted());
			stmt.setObject(8, o.getId());
			return stmt.executeUpdate();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		return 0;
	}
	
	// --------------------------------------------------------------------------------------------
	// DELETION
	
	public boolean delete(Forum o, User user, boolean doDelete, Boolean preferHard) {
		if (preferHard != null && preferHard) {
			return hardDelete(o);
		} else {
			return softDelete(o, doDelete);
		}
	}
	
	private boolean softDelete(Forum o, boolean doDelete) {
		o.setDeleted(doDelete);
		propagate(o, "deleted", "deleted < ?", o.getDeleted());
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("UPDATE " + TABLE_NAME + " SET deleted=? WHERE id=?;");
			stmt.setObject(1, doDelete);
			stmt.setObject(2, o.getId());
			return stmt.execute();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return true;
	}

	private boolean hardDelete(Forum o) {
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("DELETE FROM " + TABLE_NAME + " WHERE id=?;");
			stmt.setObject(1, o.getId());
			return stmt.execute();
		} catch (Exception e) {
			softDelete(o, true);
			e.printStackTrace();
		}
		return false;
	}
	
	private Forum processOne(PreparedStatement stmt) {
		try {
			stmt.execute();
			ResultSet rs = stmt.getResultSet();
			if (rs.next())
				return process(rs);
			else
				return null;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	private ArrayList<Object> processMany(QueryBuilder q) {
		ArrayList<Object> list = new ArrayList<Object>();
		try {
			ResultSet rs = q.getResultSet();
			while (rs.next())
				list.add(process(rs));
			return list;
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			q.close();
		}
		return list;
	}
	
	private ArrayList<Object> processMany(ResultSet rs) {
		ArrayList<Object> list = new ArrayList<Object>();
		try {
			while (rs.next())
				list.add(process(rs));
			return list;
		} catch (Exception e) {
			e.printStackTrace();
		} 
		return list;
	}
	
}
