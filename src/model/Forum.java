package model;

import java.sql.Timestamp;
import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;

import model.dao.ForumDAO;
import model.dao.UserDAO;
import views.Views;

public class Forum implements DataObject {
	
	// Attributes
	
	// Standard

	private String title;
	private String descript;
	private Integer parent;
	private Integer owner;
	private Integer vistype;
	private Timestamp date;
	private Boolean locked;
	@JsonView(Views.Admin.class)
	private Boolean deleted;
	
	// Special
	private String _ownerUsername;
	private String _parentTitle;
	private Boolean _allowPosting;
	private ArrayList<String[]> _parents;
	
	// Validation
	public String checkForErrors() {
		
		Forum parentObj = null;
		User ownerObj = null;
		
		if (id != null && (id!= 1 && parent == null)) {
			return "parent";
		}
		
		if (id != null && id == 1) {
			parent = null;
		}
		
		if (owner != null) {
			ownerObj = new UserDAO().findById(owner);
			if (ownerObj == null || ownerObj.getDeleted()) {
				return "owner";
			}
		} else {
			return "owner";
		}
		
		if (parent != null) {
			parentObj = new ForumDAO().findById(parent);
			if (parentObj == null || parentObj.getId() == this.getId() ||
				(parentObj != null && new ForumDAO().isChildOf(parentObj, this))) {
				System.err.println(parentObj.getTitle() + " " + this.getTitle());
		        return "parent";
			}
		}
		
		if (title == null || !title.matches(".{3,40}")) {
			return "title";
		}
		
		if (descript != null && descript.length() > 250) {
			return "descript";
		}
		
		if (vistype == null || vistype < 0 || vistype > 2) {
			return "vistype";
		} else if (parentObj != null) {
			if (vistype < parentObj.getVistype()) {
				return "vistype";
			}
		}
		
		if (locked == null) {
			return "locked";
		}
		
		if (deleted == null) {
			return "deleted";
		}
		
		return null;
	}

	// Constructors
	
	public Forum() {
		this.parent = 1;
		this.owner = 1;
		this.locked = false;
		this.deleted = false;
	}
	
	public Forum(Integer id, String title, String descript, Integer parent, Integer owner, Integer vistype,
		Timestamp date, Boolean locked, Boolean deleted,
		String _ownerUsername, String _parentTitle, Boolean _allowPosting) {
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
		this._ownerUsername = _ownerUsername;
		this._parentTitle = _parentTitle;
		this._allowPosting = _allowPosting;
	}

	private Integer id;
	@Override
	public String toString() {
		return "Forum [id=" + id + ", title=" + title + ", descript=" + descript + ", parent=" + parent + ", owner="
				+ owner + ", vistype=" + vistype + ", date=" + date + ", locked=" + locked + ", deleted=" + deleted
				+ ", _ownerUsername=" + _ownerUsername + ", _parentTitle=" + _parentTitle + ", _allowPosting="
				+ _allowPosting + ", _parents=" + _parents + "]";
	}
	
	// Attributes
	
	// Special
	
	@JsonProperty("_parents")
	public ArrayList<String[]> getParents() {
		return _parents;
	}

	public void setParents(ArrayList<String[]> parents) {
		this._parents = parents;
	}

	@JsonProperty("_parentTitle")
	public String getParentTitle() {
		return _parentTitle;
	}
	
	public void setParentTitle(String _parentTitle) {
		this._parentTitle = _parentTitle;
	}
	
	@JsonProperty("_ownerUsername")
	public String getOwnerName() {
		return _ownerUsername;
	}
	
	public void setOwnerUsername(String _ownerUsername) {
		this._ownerUsername = _ownerUsername;
	}
	
	@JsonProperty("_allowPosting")
	public Boolean getAllowPosting() {
		return _allowPosting;
	}
	
	public void setAllowPosting(Boolean _allowPosting) {
		this._allowPosting = _allowPosting;
	}
	
	// Standard
	
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

	public void setParent(Integer parent)
	{
		this.parent = parent;
	}
	
	public Integer getOwner()
	{
		return owner;
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
