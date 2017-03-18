package model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;

import model.Thread;
import model.dao.util.Connector;
import model.dao.util.QueryBuilder;

public class ThreadDAO
{
	private Thread process(ResultSet rs) throws Exception
	{
		return new Thread
		(
			rs.getInt("id"),
			rs.getString("title"),
			rs.getString("descript"),
			rs.getString("text"),
			rs.getInt("forum"),
			rs.getInt("owner"),
			rs.getTimestamp("date"),
			rs.getBoolean("sticky"),
			rs.getBoolean("banned"),
			rs.getBoolean("deleted")		
		);
	}
	
	private Thread processOne(PreparedStatement stmt)
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
	
	private ArrayList<Thread> processMany(QueryBuilder q)
	{
		try
		{
			ArrayList<Thread> list = new ArrayList<Thread>();
			ResultSet rs = q.getResultSet();
			while (rs.next())
				list.add(process(rs));
			return list;
		} catch (Exception e) {e.printStackTrace();}
		return null;
	}
	
	public ArrayList<Thread> filter(String title, Integer forum, Integer owner, Timestamp dateA, Timestamp dateB, Boolean includeLocked, Boolean includeDeleted, String orderBy, String asc)
	{
		QueryBuilder q = new QueryBuilder("SELECT * FROM THREAD");
		
		q.add(title, "title LIKE ?");
		q.add(forum, "forum = ?");
		q.add(owner, "owner LIKE ?");
		q.add(dateA, "dateA <= ?");
		q.add(dateB, "dateB >= ?");
		q.add(includeLocked, "locked <= ?");
		q.add(includeDeleted, "deleted <= ?");
		q.orderBy("sticky", "ASC");
		q.orderBy(orderBy, asc);

		return processMany(q);
	}
	
	public Thread findById(int id)
	{
		try (Connection conn = Connector.get(); PreparedStatement stmt = conn.prepareStatement("SELECT * FROM THREAD WHERE id=?;");)
		{
			stmt.setObject(1, id);
			return processOne(stmt);
		}
		catch (Exception e) {e.printStackTrace();}
		return null;
	}
	
	public boolean insert(Thread o)
	{
		try (Connection conn = Connector.get();)
		{
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
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		return false;
	}
	
	public int update(Thread o)
	{
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
	
	public boolean softDelete(Thread o, boolean delete)
	{
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("UPDATE THREAD SET deleted=? WHERE id=?;");
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
	
	public boolean hardDelete(Thread o)
	{
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("DELETE THREAD WHERE id=?;");
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
