 package model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

import controller.util.ParamProcessor;
import model.User;
import model.dao.util.Connector;
import model.dao.util.QueryBuilder;

public class UserDAO
{
	private String fixOrderBy(String orderBy, int role)
	{
		String fix = "username";
		if (orderBy == null) return fix;
		orderBy = orderBy.toLowerCase();
		ArrayList<String> valid = new ArrayList<String>(Arrays.asList(new String[] {"username", "email", "date", "name", "surname", "role"}));
		if (role >= User.Role.ADMIN)
		{
			valid.add("banned");
			valid.add("deleted");
		}
		
		return orderBy != null && valid.contains(orderBy) ? orderBy : fix;
	}
	
	
	private User process(ResultSet rs) throws Exception
	{
		return new User
		(
			rs.getInt("id"),
			rs.getString("username"),
			rs.getString("password"),
			rs.getString("name"),
			rs.getString("surname"),
			rs.getString("email"),
			rs.getTimestamp("date"),
			rs.getInt("role"),
			rs.getBoolean("banned"),
			rs.getBoolean("deleted")
		);
	}
	
	private User processOne(PreparedStatement stmt)
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
	
	// Used for validating logins
	public User validate(String entry, String pass)
	{
		try (Connection conn = Connector.get(); PreparedStatement stmt = conn.prepareStatement("SELECT * FROM USER WHERE (username=? OR email=?) AND password=? AND deleted=FALSE;");)
		{
			stmt.setObject(1, entry);
			stmt.setObject(2, entry);
			stmt.setObject(3, pass);
			return processOne(stmt);
		}
		catch (Exception e) {e.printStackTrace();}
		return null;
	}
	
	public String checkUnique(User o)
	{
		// null means it is
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt;
			ResultSet rs;
			
			// Check ID
			stmt = conn.prepareStatement("SELECT ID FROM USER WHERE id=?");
			stmt.setObject(1, o.getId());
			stmt.execute();
			rs = stmt.getResultSet(); 
			if (rs.next()) return "User with that ID already exists.";

			// Check Email
			stmt = conn.prepareStatement("SELECT ID FROM USER WHERE email=?");
			stmt.setObject(1, o.getEmail());
			stmt.execute();
			rs = stmt.getResultSet(); 
			if (rs.next()) return "User with that email address already exists.";

			// Check Username
			stmt = conn.prepareStatement("SELECT ID FROM USER WHERE username=?");
			stmt.setObject(1, o.getUsername());
			stmt.execute();
			rs = stmt.getResultSet(); 
			if (rs.next()) return "User with that username already exists.";
			
		}
		catch (Exception e) {e.printStackTrace();}
		return null;
		
	}
	
	public HashMap<Integer, String> getList()
	{
		HashMap<Integer, String> results = new HashMap<Integer, String>();
		try (Connection conn = Connector.get();)
		{
			Statement stmt = conn.createStatement();
			stmt.executeQuery("SELECT id, username FROM USER WHERE deleted = FALSE;");
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
			.and(pp.string("username"), "username LIKE ?")
			.and(pp.string("name"), "name LIKE ?")
			.and(pp.string("surname"), "surname LIKE ?")
			.and(pp.time("dateA"), "date >= ?")
			.and(pp.time("dateB"), "date <= ?")
			.and(pp.integer("role"), "role = ?")
			.and(pp.bool("includeBanned"), "banned <= ?", "banned = FALSE")
			.and("deleted = FALSE")
			.orderBy(fixOrderBy(pp.string("orderBy"), role), pp.string("asc"));
		}
		else
		{
			qb
			.and(pp.string("username"), "username LIKE ?")
			.and(pp.string("name"), "name LIKE ?")
			.and(pp.string("surname"), "surname LIKE ?")
			.and(pp.string("email"), "email LIKE ?")
			.and(pp.time("dateA"), "date <= ?")
			.and(pp.time("dateB"), "date >= ?")
			.and(pp.integer("role"), "role = ?")
			.and(pp.bool("includeBanned"), "banned <= ?", "banned = FALSE")
			.and(pp.bool("includeDeleted"), "deleted <= ?", "deleted = FALSE")
			.orderBy(fixOrderBy(pp.string("orderBy"), role), pp.string("asc"));
		}
	}
	
	public ArrayList<Object> filter(ParamProcessor pp, int role)
	{
		ArrayList<Object> list = new ArrayList<Object>();
		QueryBuilder qb = new QueryBuilder();
		processFilter(qb, pp, role);
		
		qb.setStart("SELECT COUNT(ID) FROM USER");
		
		list.add(qb.getNumRecords());

		qb.setStart("SELECT * FROM USER");
		qb.limit(pp.integer("page"), pp.integer("perPage"));
		list.add(processMany(qb));
		
		return list;
	}
	
	public User findById(int id, int role)
	{
		try (Connection conn = Connector.get(); PreparedStatement stmt = conn.prepareStatement("SELECT * FROM USER WHERE id=? AND deleted <= ?;");)
		{
			stmt.setObject(1, id);
			stmt.setObject(2, role == User.Role.ADMIN);
			return processOne(stmt);
		}
		catch (Exception e) {e.printStackTrace();}
		return null;
	}
	
	public User findByUsername(String username)
	{
		try (Connection conn = Connector.get(); PreparedStatement stmt = conn.prepareStatement("SELECT * FROM USER WHERE username=?;");)
		{
			stmt.setObject(1, username);
			return processOne(stmt);
		}
		catch (Exception e) {e.printStackTrace();}
		return null;
	}
	
	public User findByEmail(String email)
	{
		try (Connection conn = Connector.get(); PreparedStatement stmt = conn.prepareStatement("SELECT * FROM USER WHERE email=?;");)
		{
			stmt.setObject(1, email);
			return processOne(stmt);
		}
		catch (Exception e) {e.printStackTrace();}
		return null;
	}
	
	public boolean insert(User o)
	{
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("INSERT INTO USER "
			+ "(username, password, name, surname, email, role) VALUES (?,?,?,?,?,?);");
			stmt.setObject(1, o.getUsername());
			stmt.setObject(2, o.getPassword());
			stmt.setObject(3, o.getName());
			stmt.setObject(4, o.getSurname());
			stmt.setObject(5, o.getEmail());
			stmt.setObject(6, o.getRole());
			return stmt.execute();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		return false;
	}
	
	public int update(User o)
	{
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("UPDATE USER SET username=?, password=?, name=?, surname=?, email=?, date=?, role=?, banned=? WHERE id=?;");
			stmt.setObject(1, o.getUsername());
			stmt.setObject(2, o.getPassword());
			stmt.setObject(3, o.getName());
			stmt.setObject(4, o.getSurname());
			stmt.setObject(5, o.getEmail());
			stmt.setObject(6, o.getDate());
			stmt.setObject(7, o.getRole());
			stmt.setObject(8, o.getBanned());
			stmt.setObject(9, o.getId());
			return stmt.executeUpdate();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		return 0;
	}
	
	public boolean softDelete(User o, boolean delete)
	{
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("UPDATE USER SET deleted=? WHERE id=?;");
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
	
	public boolean hardDelete(User o)
	{
		try (Connection conn = Connector.get();)
		{
			PreparedStatement stmt = conn.prepareStatement("DELETE USER WHERE id=?;");
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
