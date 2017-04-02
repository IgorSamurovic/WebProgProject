package model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

import controller.util.ParamProcessor;
import model.Forum;
import model.User;
import model.dao.util.Connector;
import model.dao.util.QueryBuilder;

public class ForumDAO {
	
	static String[] tables = { "title", "parent", "owner", "name", "surname", "role" };

	private String checkTable(String orderBy, User user) {
		String fix = "username";
		if (orderBy == null)
			return fix;
		orderBy = orderBy.toLowerCase();
		ArrayList<String> valid = new ArrayList<String>(Arrays.asList(tables));
		if (user.getRole() >= User.Role.ADMIN) {
			valid.add("deleted");
		}

		return orderBy != null && valid.contains(orderBy) ? orderBy : fix;
	}
	
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
			rs.getBoolean("deleted")
		);

		return f;
	}

	private void processFilter(QueryBuilder qb, ParamProcessor pp, User user) {
		if (user.getRole() < User.Role.ADMIN) {
			qb
			.and("title LIKE $title")
			.and("parent = $parent")
			.and("parent = $parent")
			.and("owner = $owner")
			.and("vistype <= $vistype")
			.and("vistype <= " + user.getPermissionLevel())
			.and("date <= $dataA")
			.and("date >= $dataB")
			.and("locked <= $includeLocked")
			.and("deleted = FALSE")
			.orderBy("$orderBy", "$asc")
			.orderBy("deleted", "DESC");
		} else {
			qb
			.and("title LIKE $title")
			.and("parent = $parent")
			.and("usrowner.username LIKE $ownerUsername")
			.and("owner = $owner")
			.and("vistype <= $vistype")
			.and("date <= $dataA")
			.and("date >= $dataB")
			.and("locked <= $includeLocked")
			.and("deleted <= $includeDeleted")
			.orderBy("$orderBy", "$asc")
			.orderBy("obj.deleted", "DESC");
		}
	}

	public ArrayList<Object> filter(ParamProcessor pp, User user)
	{
		ArrayList<Object> list = new ArrayList<Object>();
		QueryBuilder qb = new QueryBuilder(pp);
		
		// Preprocess attributes
		String ownerUsername = pp.string("ownerUsername");
		//pp.remove("ownerUsername");
		//if (ownerUsername != null) {
		//	User u = new UserDAO().findByUsername(ownerUsername, user);
		//	if (u != null) {
		//		pp.add("owner", u.getId().toString());
		//	}
		//}
		
		processFilter(qb, pp, user);
		qb.setStart("SELECT COUNT(obj.ID) FROM FORUM obj");
		qb.setJoin("LEFT JOIN USER usrowner "
				+  "ON obj.owner = usrowner.id");
		
		list.add(qb.getNumRecords());


		System.err.println();
		pp.printDebug();
		
		qb.setStart("SELECT obj.*, usrowner.username FROM FORUM obj");
		
		qb.limit(pp.integer("page"), pp.integer("perPage"));
		
		list.add(processMany(qb));
		System.err.println(qb.getQuery());
		return list;
	}

	public Forum findById(int id, User user) {
		boolean adminAccess = (user == null) ? true : user.getRole() == User.Role.ADMIN; 
		try (Connection conn = Connector.get();
				PreparedStatement stmt = conn.prepareStatement(
					"SELECT * FROM FORUM WHERE id=? AND deleted <= ?;");) {
			stmt.setObject(1, id);
			stmt.setObject(2, adminAccess);
			return processOne(stmt);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
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

	public int lock(Forum o, Boolean doLock) {
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("UPDATE FORUM SET locked=? WHERE id=?;");
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

	public int update(Forum o)
	{
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("UPDATE FORUM SET title=?, descript=?, parent=?, owner=?, vistype=?, locked=? WHERE id=?;");
			stmt.setObject(1, o.getTitle());
			stmt.setObject(2, o.getDescript());
			stmt.setObject(3, o.getParent());
			stmt.setObject(4, o.getOwner());
			stmt.setObject(5, o.getVistype());
			stmt.setObject(6, o.getLocked());
			stmt.setObject(7, o.getId());
			return stmt.executeUpdate();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		return 0;
	}
	

	public boolean delete(Forum o, User user, boolean doDelete, boolean preferHard) {
		if (preferHard) {
			return hardDelete(o);
		} else {
			return softDelete(o, doDelete);
		}
	}
	
	private boolean softDelete(Forum o, boolean doDelete) {
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("UPDATE FORUM SET deleted=? WHERE id=?;");
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
			PreparedStatement stmt = conn.prepareStatement("DELETE FORUM WHERE id=?;");
			stmt.setObject(1, o.getId());
			return stmt.execute();
		} catch (Exception e) {
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
}
