package model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import controller.util.ParamProcessor;
import model.User;
import model.Post;
import model.User;
import model.dao.util.Connector;
import model.dao.util.QueryBuilder;

public class UserDAO {
	
	static String TABLE_NAME = "USER";
	static String[] tables = {"obj.username",
							  "obj.date",
							  "obj.email",
							  "obj.name",
							  "obj.surname",
							  "obj.role"
							 };
	
	static final String COUNT_QUERY_START = 
			"SELECT DISTINCT obj.id FROM " +TABLE_NAME+ " obj";

	static final String FETCH_QUERY_START = 
			" SELECT obj.* " + 
			" FROM USER obj ";
			
	static final String JOIN_STRING = "";

	// --------------------------------------------------------------------------------------------
	// Processing
	
	private User process(ResultSet rs) throws Exception {
		return new User(
			rs.getInt("id"),
			rs.getString("username"),
			rs.getString("password"),
			rs.getString("name"),
			rs.getString("surname"),
			rs.getString("email"),
			rs.getTimestamp("date"),
			rs.getInt("role"),
			rs.getBoolean("banned"),
			rs.getBoolean("deleted"));
	}
	
	private void processFilter(QueryBuilder qb, ParamProcessor pp, User user) {
		qb
		.and("id = $id")
		.and("username LIKE $username")
		.and("name LIKE $name")
		.and("surname LIKE $surname")
		.and("email LIKE $email")
		.and("date >= $dateA")
		.and("date <= $dateB")
		.and("role = $role")
		.and("deleted <= " + user.canSeeDeleted())
		.orderBy("deleted", "DESC")
		.orderBy("banned", "DESC")
		.orderBy("$orderBy", "$asc")
		.orderBy("obj.id", "ASC");
	}

	// --------------------------------------------------------------------------------------------
	// Getters
	
	@SuppressWarnings("unchecked")
	public User getFirstUser(ArrayList<Object> list) {
		return ((ArrayList<User>) list.get(1)).get(0);
	}
	
	public ArrayList<Object> filter(ParamProcessor pp, User user) {
		ArrayList<Object> list = new ArrayList<Object>();
		QueryBuilder qb = new QueryBuilder(pp);
		
		// Create part of the query that deals with filters
		processFilter(qb, pp, user);
		qb.setJoin(JOIN_STRING);
		
		// Counting
		qb.setStart(COUNT_QUERY_START);
		qb.setCounting(true);
		list.add(qb.getNumRecords());
		
		// Getting the actual records
		qb.setStart(FETCH_QUERY_START);
		qb.limit("$page", "$perPage");
		qb.setCounting(false);
		list.add(processMany(qb));
		
		return list;
	}

	// --------------------------------------------------------------------------------------------
	// Validation
	
	public User validate(String entry, String pass) {
		try (Connection conn = Connector.get();
				PreparedStatement stmt = conn.prepareStatement(
						"SELECT * FROM USER WHERE (username=? OR email=?) AND password=? AND deleted=FALSE;");) {
			stmt.setObject(1, entry);
			stmt.setObject(2, entry);
			stmt.setObject(3, pass);
			return processOne(stmt);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	public User findByUsername(String username, User user) {
		boolean adminAccess = (user == null) ? true : user.getRole() == User.Role.ADMIN; 
		try (Connection conn = Connector.get();
				PreparedStatement stmt = conn.prepareStatement(
					"SELECT * FROM USER WHERE username = ? AND deleted <= ?;");) {
			stmt.setObject(1, username);
			stmt.setObject(2, adminAccess);
			return processOne(stmt);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	public User findByEmail(String id) {
		try (Connection conn = Connector.get();
				PreparedStatement stmt = conn.prepareStatement(
					"SELECT * FROM USER WHERE email=?;");) {
			stmt.setObject(1, id);
			return processOne(stmt);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	public String checkUnique(User o) {
		// null means it is
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt;
			ResultSet rs;

			// Check ID
			stmt = conn.prepareStatement("SELECT ID FROM USER WHERE id=?");
			stmt.setObject(1, o.getId());
			stmt.execute();
			rs = stmt.getResultSet();
			if (rs.next())
				return "id";

			// Check Email
			stmt = conn.prepareStatement("SELECT ID FROM USER WHERE email=?");
			stmt.setObject(1, o.getEmail());
			stmt.execute();
			rs = stmt.getResultSet();
			if (rs.next())
				return "email";

			// Check Username
			stmt = conn.prepareStatement("SELECT ID FROM USER WHERE username=?");
			stmt.setObject(1, o.getUsername());
			stmt.execute();
			rs = stmt.getResultSet();
			if (rs.next())
				return "username";
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	// --------------------------------------------------------------------------------------------
	// SPECIAL Operations
	
	public boolean ban(User o, boolean doBan) {
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("UPDATE USER SET banned=? WHERE id=?;");
			stmt.setObject(1, doBan);
			stmt.setObject(2, o.getId());
			return stmt.execute();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return false;
	}
	
	// --------------------------------------------------------------------------------------------
	// Standard Operations
	
	public boolean insert(User o) {
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement(
				"INSERT INTO USER " + "(username, password, name, surname, email, role) VALUES (?,?,?,?,?,?);");
			stmt.setObject(1, o.getUsername());
			stmt.setObject(2, o.getPassword());
			stmt.setObject(3, o.getName());
			stmt.setObject(4, o.getSurname());
			stmt.setObject(5, o.getEmail());
			stmt.setObject(6, o.getRole());
			return stmt.execute();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return false;
	}

	public boolean update(User o) {
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement(
				"UPDATE USER SET username=?, password=?, name=?, surname=?, email=? role=?, banned=?, deleted=? WHERE id=?;");
			stmt.setObject(1, o.getUsername());
			stmt.setObject(2, o.getPassword());
			stmt.setObject(3, o.getName());
			stmt.setObject(4, o.getSurname());
			stmt.setObject(5, o.getEmail());
			stmt.setObject(6, o.getRole());
			stmt.setObject(7, o.getBanned());
			stmt.setObject(7, o.getDeleted());
			stmt.setObject(9, o.getId());
			return stmt.execute();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return false;
	}

	// --------------------------------------------------------------------------------------------
	// GENERIC STUFF
	
	@SuppressWarnings("unchecked")
	public User findById(int id, User user) {
		ParamProcessor pp = new ParamProcessor();
		pp.add("id", id);
		ArrayList<Object> all = filter(pp, user);
		if ((Integer) all.get(0) == 1) {
			return ((ArrayList<User>) all.get(1)).get(0);
		}
		return null;
	}
	
	public User findById(int id) {
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

	public boolean delete(User o, User user, boolean doDelete, Boolean preferHard) {
		if (preferHard != null && preferHard) {
			return hardDelete(o);
		} else {
			return softDelete(o, doDelete);
		}
	}
	
	private boolean softDelete(User o, boolean doDelete) {
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

	private boolean hardDelete(User o) {
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
	
	private User processOne(PreparedStatement stmt) {
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
