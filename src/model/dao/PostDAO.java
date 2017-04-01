 package model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Arrays;

import controller.util.ParamProcessor;
import model.Post;
import model.User;
import model.dao.util.Connector;
import model.dao.util.QueryBuilder;

public class PostDAO 
{
	private String fixOrderBy(String orderBy, int role)
	{
		String fix = "date";
		if (orderBy == null) return fix;
		orderBy = orderBy.toLowerCase();
		ArrayList<String> valid = new ArrayList<String>(Arrays.asList(new String[] {"text", "thread", "owner", "date"}));
		if (role >= User.Role.ADMIN)
		{
			valid.add("deleted");
		}
		
		return orderBy != null && valid.contains(orderBy) ? orderBy : fix;
	}
	
	private Post process(ResultSet rs) throws Exception
	{
		return new Post
		(
			rs.getInt("id"),
			rs.getString("text"),
			rs.getInt("thread"),
			rs.getInt("owner"),
			rs.getTimestamp("date"),
			rs.getBoolean("deleted")	
		);
	}
	
	private Post processOne(PreparedStatement stmt)
	{
		try
		{
			stmt.execute();
			ResultSet rs = stmt.getResultSet();
			if (rs.next())
				return process(rs);
			else
				return null;
		} catch (Exception e) {e.printStackTrace();}
		return null;
	}
	
	private ArrayList<Object> processMany(QueryBuilder q)
	{
		ArrayList<Object> list = new ArrayList<Object>();
		try
		{
			
			ResultSet rs = q.getResultSet();
			while (rs.next())
				list.add(process(rs));
			return list;
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		finally
		{
			q.close();
		}
		return list;
	}
	
	private void processFilter(QueryBuilder qb, ParamProcessor pp, int role)
	{
		if (role < User.Role.ADMIN)
		{
			qb
			.and("POST.id > 0")
			.and(role, "FORUM.vistype <= ?")
			.and(pp.string("text"), "POST.text LIKE ?")
			.and(pp.integer("thread"), "POST.thread = ?")
			.and(pp.integer("owner"), "POST.owner LIKE ?")
			.and(pp.time("dateA"), "POST.dateA <= ?")
			.and(pp.time("dateB"), "POST.dateB >= ?")
			.and("POST.deleted = FALSE")
			.orderBy("POST." + fixOrderBy(pp.string("orderBy"), role), pp.string("asc"));
		}
		else
		{
			qb
			.and("POST.id > 0")
			.and(pp.string("text"), "POST.text LIKE ?")
			.and(pp.integer("thread"), "POST.thread = ?")
			.and(pp.integer("owner"), "POST.owner LIKE ?")
			.and(pp.time("dateA"), "POST.dateA <= ?")
			.and(pp.time("dateB"), "POST.dateB >= ?")
			.and(pp.bool("includeDeleted"), "POST.deleted <= ?", "POST.deleted = FALSE")
			.orderBy("POST." + fixOrderBy(pp.string("orderBy"), role), pp.string("asc"));
		}
	}
	
	public ArrayList<Object> filter(ParamProcessor pp, int role)
	{
		ArrayList<Object> list = new ArrayList<Object>();
		QueryBuilder qb = new QueryBuilder();
		processFilter(qb, pp, role);
		
		;
		
		qb.setStart("SELECT COUNT(POST.ID) FROM POST RIGHT JOIN (THREAD, FORUM)" +
				" ON (POST.thread = THREAD.id AND THREAD.forum = FORUM.id)");

		list.add(getNumRecords(qb));
		System.err.println(qb.getQuery());
		
		
		qb.setStart("SELECT * FROM POST RIGHT JOIN (THREAD, FORUM)" +
				"ON (POST.thread = THREAD.id AND THREAD.forum = FORUM.id)");
		qb.limit(pp.integer("startFrom"), pp.integer("perPage"));
		list.add(processMany(qb));
		
		return list;
	}
	
	public Integer getNumRecords(QueryBuilder qb)
	{
		try
		{
			ResultSet rs = qb.getResultSet();
			if(rs.next())
				return (rs.getInt("COUNT(POST.id)"));
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		finally
		{
			qb.close();
		}
		return null;
	}
	
	public Post findById(int id, int role)
	{
		try (Connection conn = Connector.get(); PreparedStatement stmt = conn.prepareStatement(
			"SELECT POST.*, FORUM.vistype FROM POST RIGHT JOIN (THREAD, FORUM)" +
			"ON (POST.thread = THREAD.id AND THREAD.forum = FORUM.id)" +
			"WHERE POST.id = ? AND FORUM.vistype <= ? AND POST.deleted <= ?;");)
		{
			stmt.setObject(1, id);
			stmt.setObject(2, User.Role.getPermissionLevel(role));
			stmt.setObject(3, role == User.Role.ADMIN);
			System.err.println(id + " " + User.Role.getPermissionLevel(role) + " " + (role == User.Role.ADMIN));
			return processOne(stmt);
		}
		catch (Exception e) {e.printStackTrace();}
		return null;
	}
	
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
	
	public boolean softDelete(Post o, boolean delete)
	{
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("UPDATE POST SET deleted=? WHERE id=?;");
			stmt.setObject(1, delete);
			stmt.setObject(2, o.getId());
			return stmt.execute();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		return true;
	}
	
	public boolean hardDelete(Post o)
	{
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("DELETE POST WHERE id=?;");
			stmt.setObject(1, o.getId());
			return stmt.execute();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		return true;
	}

}