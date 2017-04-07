package model;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;

import views.Views;


public class User implements DataObject {
	
	// Dummy user for operations that normally require user permissions
	public final static User POWER_USER = new User(0, "POWER USER", "", "", "", "", null, Role.ADMIN, false, false);
	
	// A class for dealing with roles and permissions
	
	public static class Role {
		
		public static final int GUEST = 0;
		public static final int USER = 1;
		public static final int MOD = 2;
		public static final int ADMIN = 3;
		
		public static final int PERMISSION_LEVEL_PUBLIC = 0;
		public static final int PERMISSION_LEVEL_OPEN   = 1;
		public static final int PERMISSION_LEVEL_CLOSED = 2;
		

		public static int getPermissionLevel(Integer role) {
			switch(role) {
			case(GUEST) :return PERMISSION_LEVEL_PUBLIC;
			case(USER)  :return PERMISSION_LEVEL_OPEN;
			case(MOD)   :return PERMISSION_LEVEL_CLOSED;
			case(ADMIN) :return PERMISSION_LEVEL_CLOSED;			
			}
			return 0;
		}
		
		public static int canSeeDeleted(int role) {
			switch(role) {
			case(GUEST) :return 0;
			case(USER)  :return 0;
			case(MOD)   :return 0;
			case(ADMIN) :return 1;
			}
			return 0;
		}
		
	}

	// Attributes
	
	private Integer id;
	private String username;
	@JsonIgnore
	private String password;
	private String name;
	private String surname;
	@JsonView(Views.Personal.class)
	private String email;
	private Timestamp date;
	private Integer role;
	private Boolean banned;
	@JsonView(Views.Admin.class)
	private Boolean deleted;

	// Permission level identification
	
	@JsonIgnore public boolean isGuest() {
		return role == Role.GUEST;
	}
	
	public boolean isUser() {
		return role >= Role.USER;
	}
	
	public boolean isMod() {
		return role >= Role.MOD;
	}
	
	public boolean isAdmin() {
		return role >= Role.ADMIN;
	}

	public int getPermissionLevel() {
		return Role.getPermissionLevel(this.role);
	}
	
	public int canSeeDeleted() {
		return Role.canSeeDeleted(role);
	}
	
	// Constructors
	
	public User(Integer id, String username, String password, String name, String surname, String email, Timestamp date,
			Integer role, Boolean banned, Boolean deleted) {
		super();
		this.id = id;
		this.username = username;
		this.password = password;
		this.name = name;
		this.surname = surname;
		this.email = email;
		this.date = date;
		this.role = role;
		this.banned = banned;
		this.deleted = deleted;
	}

	public User()
	{
		super();
		this.role = Role.GUEST;
		this.banned = false;
		this.deleted = false;
	}

	// Attributes
	
	// Special
	
	@JsonProperty("date")
	public String getDateString() {
		return date.toString();
	}
	
	// Standard
	
	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getSurname() {
		return surname;
	}

	public void setSurname(String surname) {
		this.surname = surname;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
	
	public Timestamp getDate() {
		return date;
	}

	public void setDate(Timestamp date) {
		this.date = date;
	}

	public Integer getRole() {
		return role;
	}

	public void setRole(Integer role) {
		this.role = role;
	}

	public Boolean getBanned() {
		return banned;
	}

	public void setBanned(Boolean banned) {
		this.banned = banned;
	}

	public Boolean getDeleted() {
		return deleted;
	}

	public void setDeleted(Boolean deleted) {
		this.deleted = deleted;
	}
	
}
