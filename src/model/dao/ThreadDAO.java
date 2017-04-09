package model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.regex.Pattern;

import controller.util.ParamProcessor;
import model.Forum;
import model.Post;
import model.Thread;
import model.User;
import model.dao.util.Connector;
import model.dao.util.QueryBuilder;

public class ThreadDAO
{	
	static String TABLE_NAME = "THREAD";
	static String[] tables = {"obj.date", "obj.title", "usr.username"};
	
	static final String COUNT_QUERY_START = 
			"SELECT DISTINCT obj.id FROM " +TABLE_NAME+ " obj";

	static final String FETCH_QUERY_START = 
			" SELECT DISTINCT obj.*, " + 
			" usr.username, usr.role, " + 
			" frm.title, " +
			" loc.locked " + 
			" FROM THREAD obj";
			
	static final String JOIN_STRING = 
		    " LEFT JOIN (USER usr, FORUM frm) " +
			" ON (obj.owner = usr.id AND obj.forum = frm.id) " +
			" LEFT JOIN (CLOSURE delc, FORUM loc) " +   
			" ON (delc.child = frm.id AND delc.parent = loc.id and loc.locked = TRUE) " +
			" LEFT JOIN (CLOSURE locc, FORUM del) " +
			" ON (locc.child = frm.id AND locc.parent = del.id and del.deleted = TRUE) ";

	static final String JOIN_STRING_DEEP =
			" LEFT JOIN (CLOSURE anc) " +
			" ON (obj.forum = anc.child) ";
	
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
			rs.getInt("usr.role"),
			rs.getString("loc.locked") == null
		);
		return t;
	}
	
	private void processFilter(QueryBuilder qb, ParamProcessor pp, User user) {
		qb
		// Used for singular ID search, always returns 0 or 1 records
		.and("obj.id = $id")
		
		// Search queries
		// (ID)
		.and("anc.parent = $ancestor")
		.and("obj.forum = $forum")
		.and("obj.owner = $owner")
		// (Partial)
		.and("obj.title LIKE $title")
		.and("frm.title LIKE $forumTitle")
		.and("usr.username LIKE $ownerUsername")
		.and("obj.date >= $dateA")
		.and("obj.date <= $dateB")
		
		// Checks visibility type of belonging forum (public/open/closed) against permission level
		.and("frm.vistype <= " + user.getPermissionLevel())
		
		// Check if it, or its ancestors are deleted
		.and("del.deleted IS NULL") // No ancestral forums are deleted
		.and("frm.deleted = FALSE") // The forum this thread directly belongs to is not deleted
		.and("obj.deleted <= " + user.canSeeDeleted()) // Allows the user to see deleted items with proper permissions
		.and("obj.deleted <= $deleted") // Specific request to see or not see deleted entries
		
		// Orders things properly
		.orderBy("obj.deleted", "asc") // Make the deleted entries go to the bottom
		.orderBy("obj.sticky", "desc") // Show stickied threads first
		.orderBy("$orderBy", "$asc", tables) // Usually ordering by date in descending order, but can be changed for searches
		.orderBy("obj.id", "asc"); // Just to make the search stable
	}
	
	// --------------------------------------------------------------------------------------------
	// Getters
	
	@SuppressWarnings("unchecked")
	public Thread getFirstThread(ArrayList<Object> list) {
		return ((ArrayList<Thread>) list.get(1)).get(0);
	}
	
	public ArrayList<Object> filter(ParamProcessor pp, User user) {
		ArrayList<Object> list = new ArrayList<Object>();
		QueryBuilder qb = new QueryBuilder(pp);
		
		Boolean showDescendants = pp.bool("showDescendants");
		
		String join = JOIN_STRING;
		
		// Ancestry vs parenthood
		if (showDescendants != null && showDescendants) {
			pp.add("ancestor", pp.integer("forum"));
			pp.remove("forum");
			join += JOIN_STRING_DEEP;
		}
		
		// Create part of the query that deals with filters
		processFilter(qb, pp, user);
		qb.setJoin(join);
		
		// Counting
		qb.setStart(COUNT_QUERY_START);
		qb.setCounting(true);
		list.add(qb.getNumRecords());
		
		// Getting the actual records
		qb.setStart(FETCH_QUERY_START);
		qb.limit("$page", "$perPage");
		qb.setCounting(false);
		list.add(processMany(qb));
		
		// Add parent list if it's singular result
		if (pp.integer("id") != null && (Integer) list.get(0) > 0) {
			Thread obj = getFirstThread(list);
			obj.setParents(new ForumDAO().getParentList(obj.getId()));
		}
		
		if ((Integer) list.get(0) > 0) {
			@SuppressWarnings("unchecked")
			ArrayList<Thread> threads = (ArrayList<Thread>) list.get(1);
			Integer end;
			String txt;
			Integer len;
			for (Thread thread : threads) {
				if (pp.integer("id") == null) {
					txt = thread.getText();
					len = txt.length();
					
					end = Math.min(len, 100);
				
					txt = txt.substring(0, end);
					if (end < thread.getText().length()-3) {
	 					txt += "...";
	 				}
					thread.setText(txt);
				}
			}
		}
		
		//pp.printDebug();
		//qb.printDebug();
		
		return list;
	}
	
	// --------------------------------------------------------------------------------------------
	// SPECIAL OPERATIONS
	
	public boolean stick(Thread o, Boolean doStick) {
		o.setLocked(doStick);
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("UPDATE " + TABLE_NAME + " SET sticky=? WHERE id=?;");
			stmt.setObject(1, doStick);
			stmt.setObject(2, o.getId());
			return stmt.execute();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		return false;
	}
	
	public boolean lock(Thread o, Boolean doLock) {
		o.setLocked(doLock);
		//propagate(o, "locked", "locked < ?", o.getLocked());
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("UPDATE " + TABLE_NAME + " SET locked=? WHERE id=?;");
			stmt.setObject(1, doLock);
			stmt.setObject(2, o.getId());
			return stmt.execute();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		return false;
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
			stmt.execute();
			return true;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return false;
	}

	public boolean update(Thread o)
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

	private boolean hardDelete(Thread o) {
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
