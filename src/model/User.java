package model;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;

import views.Views;


public class User implements DataObject
{

	public static class Role
	{
		public static int getPermissionLevel(int role)
		{
			switch(role)
			{
			case(GUEST) :return 0;
			case(USER)  :return 1;
			case(MOD)   :return 2;
			case(ADMIN) :return 2;			
			}
			return 0;
		}
		
		public static final int GUEST = 0;
		public static final int USER = 1;
		public static final int MOD = 2;
		public static final int ADMIN = 3;
	}

	@JsonView(Views.Public.class)
	private Integer id;
	
	@JsonView(Views.Public.class)
	private String username;
	
	@JsonIgnore
	private String password;
	
	@JsonView(Views.Public.class)
	private String name;
	
	@JsonView(Views.Public.class)
	private String surname;
	
	@JsonView(Views.Personal.class)
	private String email;
	
	@JsonView(Views.Public.class)
	private Timestamp date;
	
	@JsonView(Views.Public.class)
	private Integer role;
	
	@JsonView(Views.Personal.class)
	private Boolean banned;
	
	@JsonView(Views.Admin.class)
	private Boolean deleted;

	@JsonIgnore public boolean isGuest() {
		return role == Role.GUEST;
	}
	
	@JsonIgnore public boolean isUser() {
		return role >= Role.USER;
	}
	
	@JsonIgnore public boolean isMod() {
		return role >= Role.MOD;
	}
	
	@JsonIgnore public boolean isAdmin() {
		return role >= Role.ADMIN;
	}

	public User(Integer id, String username, String password, String name, String surname, String email, Timestamp date, Integer role, Boolean banned, Boolean deleted)
	{
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

	public int getPermissionLevel() {
		return Role.getPermissionLevel(this.role);
	}
	
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

	@JsonProperty("date")
	public String getDateString() {
		return date.toString();
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
