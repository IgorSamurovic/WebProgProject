 package model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import controller.util.ParamProcessor;
import model.Post;
import model.Post;
import model.User;
import model.dao.util.Connector;
import model.dao.util.QueryBuilder;

public class PostDAO 
{
	static String TABLE_NAME = "POST";
	static String[] tables = {"obj.date", "obj.text", "thr.title", "frm.title", "usr.username"};
	
	static final String COUNT_QUERY_START = 
			"SELECT DISTINCT obj.id FROM " +TABLE_NAME+ " obj";

	static final String FETCH_QUERY_START = 
			" SELECT DISTINCT obj.*, " + 
			" usr.username, usr.role, " + 
			" thr.title, " +
			" frm.id, frm.title, " + 
			" loc.locked " + 
			" FROM POST obj ";
		
	static final String FETCH_QUERY_START_DEEP = 
			" SELECT DISTINCT obj.*, " + 
			" usr.username, usr.role, " + 
			" thr.title, " +
			" frm.id, frm.title, " + 
			" loc.locked, " + 
			" txt.id, txt.title " +
			" FROM POST obj ";
	
	static final String JOIN_STRING = 
			" LEFT JOIN (USER usr, THREAD thr, FORUM frm) " + 
		    " ON (obj.owner = usr.id AND obj.thread = thr.id AND thr.forum = frm.id) " + 
			" LEFT JOIN (CLOSURE delc, FORUM loc) " +   
			" ON (delc.child = frm.id AND delc.parent = loc.id and loc.locked = TRUE) " +
			" LEFT JOIN (CLOSURE locc, FORUM del) " +
			" ON (locc.child = frm.id AND locc.parent = del.id and del.deleted = TRUE) ";

	static final String JOIN_STRING_DEEP = 
			" LEFT JOIN (CLOSURE cls3, FORUM txt) " +
			" ON (cls3.child = frm.id AND cls3.parent = txt.id) ";
	
	// --------------------------------------------------------------------------------------------
	// Processing
	
	private Post process(ResultSet rs) throws Exception
	{
		Integer txtId = null;
		String txtTitle = null;
		
		try {
			txtId = rs.getInt("txt.id");
			txtTitle = rs.getString("txt.title");
		} catch (Exception e) {}
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
			rs.getString("frm.id"),
			rs.getString("frm.title"),
			rs.getString("loc.locked") == null,
			txtId,
			txtTitle
		);
	}

	private void processFilter(QueryBuilder qb, ParamProcessor pp, User user) {
		qb
		// Used for singular ID search, always returns 0 or 1 records
		.and("obj.id = $id")
		
		// Search queries
		// (ID)
		.and("obj.thread = $thread")
		.and("obj.owner = $owner")
	   	// (Partial)
		.and("txt.title LIKE $forumTitle")
		.and("thr.title LIKE $threadTitle")
		.and("usr.username LIKE $ownerUsername")
		.and("obj.text LIKE $text")
		.and("obj.date >= $dateA")
		.and("obj.date <= $dateB")
		
		// Checks visibility type of belonging forum (public/open/closed) against permission level
		.and("frm.vistype <= " + user.getPermissionLevel())
		
		// Check if it, or its ancestors are deleted
		.and("del.deleted IS NULL") // No ancestral forums are deleted
		.and("frm.deleted = FALSE") // The forum this post directly belongs to is not deleted
		.and("thr.deleted = FALSE") // The thread this forum belongs to is not deleted
		.and("obj.deleted <= " + user.canSeeDeleted()) // Allows the user to see deleted items with proper permissions
		.and("obj.deleted <= $deleted") // Specific request to see or not see deleted entries
		
		// Orders things properly
		.orderBy("$orderBy", "$asc", tables) // Usually ordering by date in descending order, but can be changed for searches
		.orderBy("obj.id", "asc"); // Just to make the search stable
	}
	
	// --------------------------------------------------------------------------------------------
	// Getters
	
	@SuppressWarnings("unchecked")
	public Post getFirstPost(ArrayList<Object> list) {
		return ((ArrayList<Post>) list.get(1)).get(0);
	}
	
	public ArrayList<Object> filter(ParamProcessor pp, User user) {
		ArrayList<Object> list = new ArrayList<Object>();
		QueryBuilder qb = new QueryBuilder(pp);
		
		String query;
		
		// If forum title is passed in a query, that means we need to search deeper
		String forumTitle = pp.string("forumTitle");
		if (forumTitle != null) {
			qb.setJoin(JOIN_STRING + JOIN_STRING_DEEP);
			query = FETCH_QUERY_START_DEEP;
		} else {
			qb.setJoin(JOIN_STRING);
			query = FETCH_QUERY_START;
		}

		// Create part of the query that deals with filters
		processFilter(qb, pp, user);
		
		// Counting
		qb.setStart(COUNT_QUERY_START);
		qb.setCounting(true);
		list.add(qb.getNumRecords());

		// Getting the actual records
		qb.setStart(query);
		qb.setCounting(false);
		qb.limit("$page", "$perPage");		
		list.add(processMany(qb));
		
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
			stmt.execute();
			return true;
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		return false;
	}
	
	public boolean update(Post o)
	{
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("UPDATE POST "
			+ "SET text=?, thread=?, owner=? WHERE id=?;");
			stmt.setObject(1, o.getText());
			stmt.setObject(2, o.getThread());
			stmt.setObject(3, o.getOwner());
			stmt.setObject(4, o.getId());
			return stmt.executeUpdate() > 0;
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		return false;
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
		o.setDeleted(doDelete);

		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("UPDATE " + TABLE_NAME + " SET deleted=? WHERE id=?;");
			stmt.setObject(1, doDelete);
			stmt.setObject(2, o.getId());
			return stmt.executeUpdate() > 0;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return false;
	}

	private boolean hardDelete(Post o) {
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("DELETE FROM " + TABLE_NAME + " WHERE id=?;");
			stmt.setObject(1, o.getId());
			stmt.execute();
			return true;
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
