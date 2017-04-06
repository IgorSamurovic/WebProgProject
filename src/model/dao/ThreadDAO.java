package model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import controller.util.ParamProcessor;
import model.Thread;
import model.User;
import model.dao.util.Connector;
import model.dao.util.QueryBuilder;

public class ThreadDAO
{	
	static String TABLE_NAME = "THREAD";
	static String[] tables = {"obj.date", "obj.title", "usr.username"};
	
	static final String COUNT_QUERY_START = 
			"SELECT COUNT(obj.ID) FROM "+ TABLE_NAME+ " obj";

	static final String FETCH_QUERY_START = 
			" SELECT obj.*, usr.username, usr.role, frm.title FROM THREAD obj";
			
	static final String JOIN_STRING = 
		    " LEFT JOIN USER usr " +
			" ON obj.owner = usr.id " +
			" LEFT JOIN FORUM frm " +
			" ON obj.forum = frm.id ";

	// --------------------------------------------------------------------------------------------
	// Processing

	private Thread process(ResultSet rs) throws Exception
	{
		Thread t = new Thread
		(
			rs.getInt("id"),
			rs.getString("title"),
			rs.getString("descript"),
			rs.getString("text"),
			rs.getInt("forum"),
			rs.getInt("owner"),
			rs.getTimestamp("date"),
			rs.getBoolean("sticky"),
			rs.getBoolean("locked"),
			rs.getBoolean("deleted"),	
			rs.getString("usr.username"),
			rs.getString("frm.title"),
			rs.getInt("usr.role")
		);
		return t;
	}
	
	private void processFilter(QueryBuilder qb, ParamProcessor pp, User user) {
		qb
		.and("obj.id = $id")
		.and("obj.title LIKE $title")
		.and("frm.title LIKE $forumTitle")
		.and("obj.forum = $forum")
		.and("obj.owner = $owner")
		.and("usr.username LIKE $ownerUsername")
		.and("obj.date <= $dataA")
		.and("obj.date >= $dataB")
		.and("frm.vistype <= " + user.getPermissionLevel())
		.and("frm.deleted = FALSE")
		.and("obj.deleted <= " + user.canSeeDeleted())
		.and("obj.deleted <= $deleted")
		.orderBy("obj.deleted", "asc")
		.orderBy("obj.sticky", "desc")
		.orderBy("$orderBy", "$asc", tables)
		.orderBy("obj.id", "asc");
	}
	
	// --------------------------------------------------------------------------------------------
	// Getters

	public ArrayList<Object> filter(ParamProcessor pp, User user) {
		ArrayList<Object> list = new ArrayList<Object>();
		QueryBuilder qb = new QueryBuilder(pp);
		
		Boolean showDescendants = pp.bool("showDescendants");
		
		// Let's see if we're searching through ancestry and not parenthood
		if (showDescendants != null && showDescendants) {
			pp.remove("forum");
		}
		
		// Create part of the query that deals with filters
		processFilter(qb, pp, user);
		qb.setJoin(JOIN_STRING);
		
		qb.setStart(COUNT_QUERY_START);
		list.add(qb.getNumRecords());

		//pp.printDebug();
		
		qb.setStart(FETCH_QUERY_START);
		qb.limit("$page", "$perPage");
		
		list.add(processMany(qb));
		
		return list;
	}
	
	// --------------------------------------------------------------------------------------------
	// SPECIAL OPERATIONS
	
	public int stick(Thread o, Boolean doStick) {
		o.setLocked(doStick);
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("UPDATE " + TABLE_NAME + " SET sticky=? WHERE id=?;");
			stmt.setObject(1, doStick);
			stmt.setObject(2, o.getId());
			return stmt.executeUpdate();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		return 0;
	}
	
	public int lock(Thread o, Boolean doLock) {
		o.setLocked(doLock);
		//propagate(o, "locked", "locked < ?", o.getLocked());
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
	
	public boolean insert(Thread o) {
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("INSERT INTO THREAD "
			+ "(title, descript, text, forum, owner, sticky, locked) VALUES (?,?,?,?,?,?,?);");
			stmt.setObject(1, o.getTitle());
			stmt.setObject(2, o.getDescript());
			stmt.setObject(3, o.getText());
			stmt.setObject(4, o.getForum());
			stmt.setObject(5, o.getOwner());
			stmt.setObject(6, o.getSticky());
			stmt.setObject(7, o.getLocked());
			return stmt.execute();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return false;
	}

	public int update(Thread o)
	{
		//propagate(o, "vistype", "vistype < ?", o.getVistype());
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("UPDATE THREAD "
			+ "SET title=?, descript=?, text=?, forum=?, owner=?, sticky=?, locked=? WHERE id=?;");
			stmt.setObject(1, o.getTitle());
			stmt.setObject(2, o.getDescript());
			stmt.setObject(3, o.getText());
			stmt.setObject(4, o.getForum());
			stmt.setObject(5, o.getOwner());
			stmt.setObject(6, o.getSticky());
			stmt.setObject(7, o.getLocked());
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
	// GENERIC STUFF
	
	@SuppressWarnings("unchecked")
	public Thread findById(int id, User user) {
		ParamProcessor pp = new ParamProcessor();
		pp.add("id", id);
		ArrayList<Object> all = filter(pp, user);
		if ((Integer) all.get(0) == 1) {
			return ((ArrayList<Thread>) all.get(1)).get(0);
		}
		return null;
	}
	
	public Thread findById(int id) {
		try (Connection conn = Connector.get();
				PreparedStatement stmt = conn.prepareStatement(
				FETCH_QUERY_START + JOIN_STRING + " WHERE obj.id = ?;");) {
			
			stmt.setObject(1, id);
			return processOne(stmt);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	public boolean delete(Thread o, User user, boolean doDelete, Boolean preferHard) {
		if (preferHard != null && preferHard) {
			return hardDelete(o);
		} else {
			return softDelete(o, doDelete);
		}
	}
	
	private boolean softDelete(Thread o, boolean doDelete) {
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
	
	private boolean hardDelete(Thread o) {
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("DELETE FROM " + TABLE_NAME + " WHERE id=?;");
			stmt.setObject(1, o.getId());
			return stmt.execute();
		} catch (Exception e) {
			softDelete(o, true);
		}
		return false;
	}

	private Thread processOne(PreparedStatement stmt) {
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
}
