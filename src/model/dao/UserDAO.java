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

public class UserDAO {

	static String[] tables = { "username", "email", "date", "name", "surname", "role" };

	private String fixOrderBy(String orderBy, User user) {
		String fix = "username";
		if (orderBy == null)
			return fix;
		orderBy = orderBy.toLowerCase();
		ArrayList<String> valid = new ArrayList<String>(Arrays.asList(tables));
		if (user.getRole() >= User.Role.ADMIN) {
			valid.add("banned");
			valid.add("deleted");
		}

		return orderBy != null && valid.contains(orderBy) ? orderBy : fix;
	}

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

	private User processOne(PreparedStatement stmt) {
		try {
			stmt.execute();
			ResultSet rs = stmt.getResultSet();
			if (rs.next()) {
				return process(rs);
			} else {
				return null;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	private ArrayList<Object> processMany(QueryBuilder q) {
		ArrayList<Object> list = new ArrayList<Object>();
		try {
			ResultSet rs = q.getResultSet();
			while (rs.next()) {
				list.add(process(rs));
			}
			return list;
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			q.close();
		}
		return list;
	}

	// Used for validating logins
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
				return "User with that ID already exists.";

			// Check Email
			stmt = conn.prepareStatement("SELECT ID FROM USER WHERE email=?");
			stmt.setObject(1, o.getEmail());
			stmt.execute();
			rs = stmt.getResultSet();
			if (rs.next())
				return "User with that email address already exists.";

			// Check Username
			stmt = conn.prepareStatement("SELECT ID FROM USER WHERE username=?");
			stmt.setObject(1, o.getUsername());
			stmt.execute();
			rs = stmt.getResultSet();
			if (rs.next())
				return "User with that username already exists.";
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	private void processFilter(QueryBuilder qb, ParamProcessor pp, User user) {
		if (user.getRole() < User.Role.ADMIN) { /*
			qb
			.and("$username", "username LIKE ?")
			.and("$name", "name LIKE ?")
			.and("$surname", "surname LIKE ?")
			.and("$dateA", "date >= ?")					
			.and("date <= $dateB")
			.and(pp.integer("role"), "role = ?")
			.and(pp.bool("includeBanned"), "banned <= ?", "banned = FALSE")
			.and("deleted = FALSE")
			.orderBy(fixOrderBy(pp.string("orderBy"), user), pp.string("asc"));
			*/
		} else { 
			qb
			.and("username LIKE $username")
			.and("name LIKE $name")
			.and("surname LIKE $surname")
			.and("email LIKE $email")
			.and("date >= $dateA")
			.and("date <= $dateB")
			.and("role = $role")
			.and("banned <= $banned")
			.and("deleted <= $deleted")
			.orderBy("deleted", "DESC")
			.orderBy("$orderBy", "$asc");
		}
	}

	public ArrayList<Object> filter(ParamProcessor pp, User user) {
		ArrayList<Object> list = new ArrayList<Object>();
		QueryBuilder qb = new QueryBuilder(pp);
		processFilter(qb, pp, user);
		pp.printDebug();
		qb.setStart("SELECT COUNT(obj.ID) FROM USER obj");

		list.add(qb.getNumRecords());

		qb.setStart("SELECT * FROM USER obj");
		qb.limit(pp.integer("page"), pp.integer("perPage"));
		list.add(processMany(qb));

		return list;
	}

	public User findById(int id, User user) {
		boolean adminAccess = (user == null) ? true : user.getRole() == User.Role.ADMIN; 
		try (Connection conn = Connector.get();
				PreparedStatement stmt = conn.prepareStatement(
					"SELECT * FROM USER WHERE id=? AND deleted <= ?;");) {
			stmt.setObject(1, id);
			stmt.setObject(2, adminAccess);
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

	public User findByEmail(String id, User user) {
		boolean adminAccess = (user == null) ? true : user.getRole() == User.Role.ADMIN; 
		try (Connection conn = Connector.get();
				PreparedStatement stmt = conn.prepareStatement(
					"SELECT * FROM USER WHERE email=? AND deleted <= ?;");) {
			stmt.setObject(1, id);
			stmt.setObject(2, adminAccess);
			return processOne(stmt);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

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

	public int update(User o) {
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
			return stmt.executeUpdate();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return 0;
	}

	public boolean ban(User o, boolean doBan) {
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("UPDATE USER SET banned=? WHERE id=?;");
			stmt.setObject(1, doBan);
			stmt.setObject(2, o.getId());
			return stmt.execute();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return true;
	}
	
	public boolean delete(User o, User user, boolean doDelete, boolean preferHard) {
		if (preferHard) {
			return hardDelete(o);
		} else {
			return softDelete(o, doDelete);
		}
	}
	
	public boolean softDelete(User o, boolean doDelete) {
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("UPDATE USER SET deleted=? WHERE id=?;");
			stmt.setObject(1, doDelete);
			stmt.setObject(2, o.getId());
			return stmt.execute();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return true;
	}

	public boolean hardDelete(User o) {
		try (Connection conn = Connector.get();) {
			PreparedStatement stmt = conn.prepareStatement("DELETE USER WHERE id=?;");
			stmt.setObject(1, o.getId());
			return stmt.execute();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return false;
	}
}
