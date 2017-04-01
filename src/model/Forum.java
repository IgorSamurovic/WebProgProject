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
	
	public Forum()
	{
		this.locked = false;
		this.deleted = false;
	}
	
	@Override
	public String toString() {
		return "Forum [id=" + id + ", title=" + title + ", descript=" + descript + ", parent=" + parent + ", owner="
				+ owner + ", vistype=" + vistype + ", date=" + date + ", locked=" + locked + ", deleted=" + deleted
				+ "]";
	}

	public Forum(Integer id, String title, String descript, Integer parent, Integer owner, Integer vistype, Timestamp date, Boolean locked, Boolean deleted)
	{
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
		} else {
			return new ForumDAO().findById(this.parent, User.Role.ADMIN).getTitle();
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
	public String getOwnerName()
	{
		return new UserDAO().findById(this.owner, User.Role.ADMIN).getUsername();
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
