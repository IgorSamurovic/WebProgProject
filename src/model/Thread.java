package model;

import java.sql.Timestamp;
import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;

import model.dao.ForumDAO;
import model.dao.UserDAO;
import views.Views;

public class Thread implements DataObject {

	// Attributes
	
	// Standard
	private Integer id;
	private String title;
	private String descript;
	private String text;
	private Integer forum;
	private Integer owner;
	private Timestamp date;
	private Boolean sticky;
	private Boolean locked;
	@JsonView(Views.Admin.class)
	private Boolean deleted;
	
	// Special
	private String _ownerUsername;
	private String _forumTitle;
	private Integer _ownerRole;
	private Boolean _allowPosting;
	private ArrayList<String[]> _parents;
	
	// Validation
	public String checkForErrors() {
		
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
			ownerObj = new UserDAO().findById(owner);
			if (ownerObj == null) {
				return "owner";
			}
		}
		
		if (sticky == null) {
			return "sticky";
		}
		
		if (deleted == null) {
			return "deleted";
		}
		
		return null;
	}
	
	// Constructors

	public Thread() {
		super();
		this.sticky = false;
		this.locked = false;
		this.deleted = false;
	}
	
	public Thread(Integer id, String title, String descript, String text, Integer forum, Integer owner,
		Timestamp date, Boolean sticky, Boolean locked, Boolean deleted,
		String _ownerUsername, String _forumTitle, Integer _ownerRole, Boolean _allowPosting) {
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
		this._ownerUsername = _ownerUsername;
		this._forumTitle = _forumTitle;
		this._ownerRole = _ownerRole;
		this._allowPosting = _allowPosting;
	}
	
	@Override
	public String toString() {
		return "Thread [id=" + id + ", title=" + title + ", descript=" + descript + ", text=" + text + ", forum="
				+ forum + ", owner=" + owner + ", date=" + date + ", sticky=" + sticky + ", locked=" + locked
				+ ", deleted=" + deleted + ", _ownerUsername=" + _ownerUsername + ", _forumTitle=" + _forumTitle
				+ ", _ownerRole=" + _ownerRole + ", _allowPosting=" + _allowPosting + ", _parents=" + _parents + "]";
	}
	
	// Attributes
	
	// Special
	
	@JsonProperty("_ownerUsername")
	public String getOwnerUsername() {
		return _ownerUsername;
	}

	public void setOwnerUsername(String _ownerUsername) {
		this._ownerUsername = _ownerUsername;
	}

	@JsonProperty("_forumTitle")
	public String getForumTitle() {
		return _forumTitle;
	}

	public void setForumTitle(String _forumTitle) {
		this._forumTitle = _forumTitle;
	}

	@JsonProperty("_ownerRole")
	public Integer getOwnerRole() {
		return _ownerRole;
	}

	public void setOwnerRole(Integer _ownerRole) {
		this._ownerRole = _ownerRole;
	}

	@JsonProperty("_allowPosting")
	public Boolean getAllowPosting() {
		return _allowPosting;
	}

	public void setAllowPosting(Boolean _allowPosting) {
		this._allowPosting = _allowPosting;
	}

	@JsonProperty("_parents")
	public ArrayList<String[]> getParents() {
		return _parents;
	}

	public void setParents(ArrayList<String[]> arrayList) {
		this._parents = arrayList;
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
	
	public String getText()
	{
		return text;
	}
	
	public void setText(String text)
	{
		this.text = text;
	}
	
	public Integer getForum()
	{
		return forum;
	}
	
	public void setForum(Integer forum)
	{
		this.forum = forum;
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
