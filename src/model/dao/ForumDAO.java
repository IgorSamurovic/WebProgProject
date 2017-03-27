package model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;

import controller.util.ParamProcessor;
import model.Forum;
import model.User;
import model.dao.util.Connector;
import model.dao.util.QueryBuilder;

public class ForumDAO
{
	private Forum process(ResultSet rs) throws Exception
	{
		return new Forum
		(
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
	}
	
	private Forum processOne(PreparedStatement stmt)
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
	
	public HashMap<Integer, String> getList()
	{
		HashMap<Integer, String> results = new HashMap<Integer, String>();
		try (Connection conn = Connector.get();)
		{
			Statement stmt = conn.createStatement();
			stmt.executeQuery("SELECT id, title FROM FORUM WHERE deleted = FALSE;");
			ResultSet rs = stmt.getResultSet();
			
			while (rs.next())
				results.put(rs.getInt("id"), rs.getString("title"));
			
			return results;
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		
		return null;
	}
	
	private void processFilter(QueryBuilder qb, ParamProcessor pp, int role)
	{
		if (role < User.Role.ADMIN)
		{
			qb
			.and(pp.string("title"), "title LIKE ?")
			.and(pp.string("parent"), "parent = ?")
			.and(pp.string("owner"), "owner = ?")
			.and(pp.string("vistype"), "vistype <= ?")
			.and("vistype <= " + role)
			.and(pp.string("dataA"), "dateA <= ?")
			.and(pp.string("dataB"), "dateB >= ?")
			.and(pp.string("includeLocked"), "locked <= ?")
			.and("deleted = FALSE")
			.orderBy(pp.string("orderBy"), pp.string("asc"));
		}
		else
		{
			qb
			.and(pp.string("title"), "title LIKE ?")
			.and(pp.string("parent"), "parent = ?")
			.and(pp.string("owner"), "owner = ?")
			.and(pp.string("vistype"), "vistype <= ?")
			
			.and(pp.string("dataA"), "dateA <= ?")
			.and(pp.string("dataB"), "dateB >= ?")
			.and(pp.string("includeLocked"), "locked <= ?")
			.and(pp.string("includeDeleted"), "deleted <= ?", "deleted = FALSE")
			.orderBy(pp.string("orderBy"), pp.string("asc"));
		}
	}
	
	public ArrayList<Object> filter(ParamProcessor pp, int role)
	{
		ArrayList<Object> list = new ArrayList<Object>();
		QueryBuilder qb = new QueryBuilder();
		processFilter(qb, pp, role);
		
		qb.setStart("SELECT COUNT(ID) FROM FORUM");
		
		list.add(getNumRecords(qb));

		qb.setStart("SELECT * FROM FORUM");
		qb.limit(pp.integer("page"), pp.integer("perPage"));
		list.add(processMany(qb));
		
		return list;
	}
	
	public Integer getNumRecords(QueryBuilder qb)
	{
		try
		{
			ResultSet rs = qb.getResultSet();
			if(rs.next())
				return (rs.getInt("COUNT(id)"));
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
	
	public Forum findById(int id)
	{
		try (Connection conn = Connector.get(); PreparedStatement stmt = conn.prepareStatement("SELECT * FROM FORUM WHERE id=?;");)
		{
			stmt.setObject(1, id);
			return processOne(stmt);
		}
		catch (Exception e) {e.printStackTrace();}
		return null;
	}
	
	public Forum findByForumname(String username)
	{
		try (Connection conn = Connector.get(); PreparedStatement stmt = conn.prepareStatement("SELECT * FROM FORUM WHERE username=?;");)
		{
			stmt.setObject(1, username);
			return processOne(stmt);
		}
		catch (Exception e) {e.printStackTrace();}
		return null;
	}
	
	public Forum findByEmail(String email)
	{
		try (Connection conn = Connector.get(); PreparedStatement stmt = conn.prepareStatement("SELECT * FROM FORUM WHERE email=?;");)
		{
			stmt.setObject(1, email);
			return processOne(stmt);
		}
		catch (Exception e) {e.printStackTrace();}
		return null;
	}
	
	public boolean insert(Forum o)
	{
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("INSERT INTO FORUM "
			+ "(title, descript, parent, owner, vistype, locked) VALUES (?,?,?,?,?,?,?);");
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
	
	public boolean softDelete(Forum o, boolean delete)
	{
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("UPDATE FORUM SET deleted=? WHERE id=?;");
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
	
	public boolean hardDelete(Forum o)
	{
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("DELETE FORUM WHERE id=?;");
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
