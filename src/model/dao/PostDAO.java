 package model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import controller.util.ParamProcessor;
import model.Post;
import model.User;
import model.dao.util.Connector;
import model.dao.util.QueryBuilder;

public class PostDAO 
{
	static String TABLE_NAME = "POST";
	static String[] tables = {"obj.date", "obj.text", "thr.title", "frm.title", "usr.username"};
	
	static final String COUNT_QUERY_START = 
			"SELECT COUNT(obj.ID) FROM " +TABLE_NAME+ " obj";

	static final String FETCH_QUERY_START = 
			" SELECT obj.*, " + 
			" usr.username, usr.role, " + 
			" thr.title, thr.deleted, " +
			" frm.title, frm.deleted, frm.vistype " + 
			" FROM POST obj ";
			
	static final String JOIN_STRING = 
			" LEFT JOIN (USER usr, THREAD thr, FORUM frm) " + 
		    " ON (obj.owner = usr.id AND obj.thread = thr.id AND thr.forum = frm.id) ";

	// --------------------------------------------------------------------------------------------
	// Processing
	
	private Post process(ResultSet rs) throws Exception
	{
		return new Post
		(
			rs.getInt("id"),
			rs.getString("text"),
			rs.getInt("thread"),
			rs.getInt("owner"),
			rs.getTimestamp("date"),
			rs.getBoolean("deleted"),
			
			rs.getString("usr.username"),
			rs.getInt("usr.role"),
			rs.getString("thr.title"),
			rs.getString("frm.title")
		);
	}

	private void processFilter(QueryBuilder qb, ParamProcessor pp, User user) {
		qb
		.and("obj.id = $id")
		.and("thr.title LIKE $threadTitle")
		.and("obj.thread = $thread")
		.and("obj.owner = $owner")
		.and("usr.username LIKE $ownerUsername")
		.and("obj.text LIKE $text")
		.and("obj.date <= $dataA")
		.and("obj.date >= $dataB")
		.and("frm.vistype <= " + user.getPermissionLevel())
		.and("frm.deleted = FALSE")
		.and("thr.deleted = FALSE")
		.and("obj.deleted <= " + user.canSeeDeleted())
		.and("obj.deleted <= $deleted")
		.orderBy("$orderBy", "$asc", tables)
		.orderBy("obj.id", "asc");
	}
	
	// --------------------------------------------------------------------------------------------
	// Getters
	
	public ArrayList<Object> filterByForumTitle(QueryBuilder qb, ParamProcessor pp, User user) {
		
		// IMPLEMENT
		return null;
	}
	
	public ArrayList<Object> filter(ParamProcessor pp, User user) {
		ArrayList<Object> list = new ArrayList<Object>();
		QueryBuilder qb = new QueryBuilder(pp);
		
		// Create part of the query that deals with filters
		processFilter(qb, pp, user);
		qb.setJoin(JOIN_STRING);
		
		qb.setStart(COUNT_QUERY_START);
		list.add(qb.getNumRecords());

		//pp.printDebug();
		
		qb.setStart(FETCH_QUERY_START);
		qb.limit("$page", "$perPage");
		
		list.add(processMany(qb));
		
		if (pp.string("forumTitle") != null) {
			filterByForumTitle(qb, pp, user);
		}
		
		return list;
	}

	// --------------------------------------------------------------------------------------------
	// Standard Operations
	
	public boolean insert(Post o)
	{
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("INSERT INTO POST "
			+ "(text, thread, owner) VALUES (?,?,?);");
			stmt.setObject(1, o.getText());
			stmt.setObject(2, o.getThread());
			stmt.setObject(3, o.getOwner());
			return stmt.execute();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		return false;
	}
	
	public int update(Post o)
	{
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("UPDATE POST "
			+ "SET text=?, thread=?, owner=? WHERE id=?;");
			stmt.setObject(1, o.getText());
			stmt.setObject(2, o.getThread());
			stmt.setObject(3, o.getOwner());
			stmt.setObject(4, o.getId());
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
	public Post findById(int id, User user) {
		ParamProcessor pp = new ParamProcessor();
		pp.add("id", id);
		ArrayList<Object> all = filter(pp, user);
		if ((Integer) all.get(0) == 1) {
			return ((ArrayList<Post>) all.get(1)).get(0);
		}
		return null;
	}
	
	public Post findById(int id) {
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

	public boolean delete(Post o, User user, boolean doDelete, Boolean preferHard) {
		if (preferHard != null && preferHard) {
			return hardDelete(o);
		} else {
			return softDelete(o, doDelete);
		}
	}
	
	private boolean softDelete(Post o, boolean doDelete) {
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
	
	private boolean hardDelete(Post o) {
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("DELETE FROM " + TABLE_NAME + " WHERE id=?;");
			stmt.setObject(1, o.getId());
			return stmt.execute();
		} catch (Exception e) {
			softDelete(o, true);
		}
		return false;
	}

	private Post processOne(PreparedStatement stmt) {
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
