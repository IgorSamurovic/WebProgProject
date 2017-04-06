package model;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;

import model.dao.ForumDAO;
import model.dao.UserDAO;
import views.Views;

public class Thread implements DataObject
{
	@JsonView(Views.Public.class)
	private Integer id;
	
	@JsonView(Views.Public.class)
	private String title;
	
	@JsonView(Views.Public.class)
	private String descript;
	
	@JsonView(Views.Public.class)
	private String text;
	
	@JsonView(Views.Public.class)
	private Integer forum;
	
	@JsonView(Views.Public.class)
	private Integer owner;
	
	@JsonView(Views.Public.class)
	private Timestamp date;
	
	@JsonView(Views.Public.class)
	private Boolean sticky;
	
	@JsonView(Views.Public.class)
	private Boolean locked;
	
	@JsonView(Views.Admin.class)
	private Boolean deleted;
	
	private String ownerUsername;
	private String forumTitle;
	private Integer ownerRole;

	public String valid() {
		
		Forum forumObj = null;
		User ownerObj = null;
		
		if (title == null || !title.matches(".{3,40}")) {
			return "title";
		}
		
		if (descript != null && descript.length() > 250) {
			return "descript";
		}
		
		if (text == null || (text != null && text.length() > 1000)) {
			return "text";
		}

		if (forum != null) {
			forumObj = new ForumDAO().findById(forum);
			if (forumObj == null) {
				return "forum";
			}
		}
		
		if (owner != null) {
			ownerObj = new UserDAO().findById(owner, null);
			if (ownerObj == null) {
				return "owner";
			}
		}
		
		if (sticky == null) {
			return "sticky";
		}
		
		if (deleted == null) {
			return "deleted";
		} else if (id != null && forumObj != null) {
			if (!deleted && forumObj.getDeleted()) {
				return "deleted";
			}
		}
		
		return "";
	}
	
	public Thread(Integer id, String title, String descript, String text, Integer forum, Integer owner,
	Timestamp date, Boolean sticky, Boolean locked, Boolean deleted, String ownerUsername, String forumTitle, Integer ownerRole)
	{
		super();
		this.id = id;
		this.title = title;
		this.descript = descript;
		this.text = text;
		this.forum = forum;
		this.owner = owner;
		this.date = date;
		this.sticky = sticky;
		this.locked = locked;
		this.deleted = deleted;
		this.ownerUsername = ownerUsername;
		this.forumTitle = forumTitle;
		this.ownerRole = ownerRole;
	}
	
	// Special getters
	
	@JsonProperty("_ownerRole")
	public Integer getOwnerRole() {
		return ownerRole;
	}
	

	public Thread()
	{
		super();
		this.sticky = false;
		this.locked = false;
		this.deleted = false;
	}


	public Integer getId()
	{
		return id;
	}
	
	public void setId(Integer id)
	{
		this.id = id;
	}
	
	public String getTitle()
	{
		return title;
	}
	
	public void setTitle(String title)
	{
		this.title = title;
	}
	
	public String getDescript()
	{
		return descript;
	}
	
	public void setDescript(String descript)
	{
		this.descript = descript;
	}
	
	public String getText()
	{
		return text;
	}
	
	public void setText(String text)
	{
		this.text = text;
	}
	
	@JsonProperty("_forumTitle")
	public String getForumTitle() {
		if (this.forum == null || this.forum == 0) {
			return "Forum";
		} else if (this.forumTitle == null) {
			return new ForumDAO().findById(this.forum, null).getTitle();
		} else {
			return this.forumTitle;
		}
	}
	
	public Integer getForum()
	{
		return forum;
	}
	
	public void setForum(Integer forum)
	{
		this.forum = forum;
	}
	
	@JsonProperty("_ownerUsername")
	public String getOwnerName() {
		if (this.ownerUsername == null) {
			return new UserDAO().findById(this.owner, null).getUsername();
		} else {
			return this.ownerUsername;
		}
	}
	
	public Integer getOwner()
	{
		return owner;
	}
	
	public void setOwner(Integer owner)
	{
		this.owner = owner;
	}
	
	@JsonProperty("date")
	public String getDateString()
	{
		return date.toString();
	}
	
	public Timestamp getDate()
	{
		return date;
	}
	
	public void setDate(Timestamp date)
	{
		this.date = date;
	}
	
	public Boolean getSticky()
	{
		return sticky;
	}
	
	public void setSticky(Boolean sticky)
	{
		this.sticky = sticky;
	}
	
	public Boolean getLocked()
	{
		return locked;
	}
	
	public void setLocked(Boolean locked)
	{
		this.locked = locked;
	}
	
	public Boolean getDeleted() {
		return deleted;
	}
	
	public void setDeleted(Boolean deleted)
	{
		this.deleted = deleted;
	}

}
