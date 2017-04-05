package model;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonProperty;

import model.dao.ForumDAO;
import model.dao.UserDAO;

public class Forum implements DataObject
{
	private Integer id;
	private String title;
	private String descript;
	private Integer parent;
	private Integer owner;
	private Integer vistype;
	private Timestamp date;
	private Boolean locked;
	private Boolean deleted;
	
	private String ownerUsername;
	private String parentTitle;
	
	public boolean isChildOf(Forum ancestor) {
		// daddy forum
		if (this.id == 1 || this.getId() == ancestor.getId()) return false;
		int ancestorId = ancestor.getId();
		
		Forum child = this;
		while(child.getId() != 1) {
			if (child.getParent() == ancestorId) {
				return true;
			} else {
				child = new ForumDAO().findById(child.getParent(), null);

			}
		}
		
		return false;
	}
	
	public String valid() {
		
		Forum parentObj = null;
		
		if (title == null || !title.matches(".{3,40}")) {
			return "title";
		}
		
		if (descript != null && descript.length() > 250) {
			return "descript";
		}

		if (id != null && id == 1) parent = null;
		
		if (id != null && parent != null && id != 1) {
			parentObj = new ForumDAO().findById(parent, null);
			if (parentObj == null || parentObj.getId() == this.getId() || (parentObj != null && parentObj.isChildOf(this))) {
		        return "parent";
			}
		} 
		
		if (id != null && (id!= 1 && parent == null)) {
			return "parent";
		}
		
		if (owner == null || new UserDAO().findById(owner, null) == null) {
			return "owner";
		}
		
		if (vistype == null || vistype < 0 || vistype > 2) {
			return "vistype";
		} else if (id != null && parentObj != null) {
			if (vistype < parentObj.getVistype()) {
				return "vistype";
			}
		}
		
		if (locked == null) {
			return "locked";
		} else if (id != null && parentObj != null) {
			if (!locked && parentObj.getLocked()) {
				return "locked";
			}
		}
		
		if (deleted == null) {
			return "deleted";
		} else if (id != null && parentObj != null) {
			if (!deleted && parentObj.getDeleted()) {
				return "deleted";
			}
		}
		
		return "";
	}

	public Forum()
	{
		this.parent = 1;
		this.owner = 1;
		this.locked = false;
		this.deleted = false;
	}
	
	@Override
	public String toString() {
		return "Forum [id=" + id + ", title=" + title + ", descript=" + descript + ", parent=" + parent + ", owner="
				+ owner + ", vistype=" + vistype + ", date=" + date + ", locked=" + locked + ", deleted=" + deleted
				+ "]";
	}

	public Forum(Integer id, String title, String descript, Integer parent, Integer owner, Integer vistype,
		Timestamp date, Boolean locked, Boolean deleted, String ownerUsername, String parentTitle) {
		super();
		this.id = id;
		this.title = title;
		this.descript = descript;
		this.parent = parent;
		this.owner = owner;
		this.vistype = vistype;
		this.date = date;
		this.locked = locked;
		this.deleted = deleted;
		this.ownerUsername = ownerUsername;
		this.parentTitle = parentTitle;
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

	public Integer getParent()
	{
		return parent;
	}

	@JsonProperty("_parentTitle")
	public String getParentTitle() {
		if (this.parent == null || this.parent == 0) {
			return "Forum";
		} else if (this.parentTitle == null) {
			return new ForumDAO().findById(this.parent, null).getTitle();
		} else {
			return this.parentTitle;
		}
	}
	
	@JsonProperty("_deletable")
	public Boolean getDeletable() {
		if (this.parent != null && this.id != 1) {
			return !(new ForumDAO().findById(this.parent, null).getDeleted());
		} else {
			return false; 
		}
	}
	
	@JsonProperty("_lockable")
	public Boolean getLockable() {
		if (this.parent != null && this.id != 1) {
			return !(new ForumDAO().findById(this.parent, null).getLocked());
		} else {
			return false; 
		}
	}
	
	public void setParent(Integer parent)
	{
		this.parent = parent;
	}

	public Integer getOwner()
	{
		return owner;
	}
	
	@JsonProperty("_ownerUsername")
	public String getOwnerName() {
		if (this.ownerUsername == null) {
			return new UserDAO().findById(this.owner, null).getUsername();
		} else {
			return this.ownerUsername;
		}
	}

	public void setOwner(Integer owner)
	{
		this.owner = owner;
	}
	
	public Integer getVistype()
	{
		return vistype;
	}

	public void setVistype(Integer vistype)
	{
		this.vistype = vistype;
	}

	public Timestamp getDate()
	{
		return date;
	}

	@JsonProperty("date")
	public String getDateString()
	{
		return String.valueOf(date);
	}
	
	public void setDate(Timestamp date)
	{
		this.date = date;
	}

	public Boolean getLocked()
	{
		return locked;
	}

	public void setLocked(Boolean locked)
	{
		this.locked = locked;
	}

	public Boolean getDeleted()
	{
		return deleted;
	}

	public void setDeleted(Boolean deleted)
	{
		this.deleted = deleted;
	}
	
}
