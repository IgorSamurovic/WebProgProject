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
	
	public boolean isChildOf(Forum ancestor) {
		// daddy forum
		if (this.id == 1 || this.getId() == ancestor.getId()) return false;
		int ancestorId = ancestor.getId();
		
		Forum child = this;
		
		while(child.getId() != 1 && child.getParent() != 1) {
			if (child.getParent() == ancestorId) {
				return true;
			} else {
				child = new ForumDAO().findById(child.getParent(), null);
				System.err.println(child.getTitle());
			}
		}
		
		return false;
	}
	
	public String valid() {
		
		if (title == null || !title.matches(".{3,40}")) {
			return "title";
		}
		
		if (descript != null && descript.length() > 250) {
			return "descript";
		}
		
		if (vistype == null || vistype < 0 || vistype > 2)
			return "vistype";

		if (!(id == 1)) {
			Forum parentTest = new ForumDAO().findById(parent, null);
			if (parentTest == null || parentTest.getId() == this.getId() || (parentTest != null && parentTest.isChildOf(this))) {
		        return "parent";
			}
		} else {
			parent = null;
		}
		
		if (owner == null || new UserDAO().findById(owner, null) == null) {
			return "owner";
		}
		
		if (locked == null) {
			return "locked";
		}
		
		if (deleted == null) {
			return "deleted";
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
			return new ForumDAO().findById(this.parent, null).getTitle();
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
		return new UserDAO().findById(this.owner, null).getUsername();
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
