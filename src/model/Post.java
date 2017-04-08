package model;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonProperty;

import model.dao.ThreadDAO;
import model.dao.UserDAO;

public class Post implements DataObject {
	
	// Attributes
	
	// Standard
	private Integer id;
	private String text;
	private Integer thread;
	private Integer owner;
	private Timestamp date;
	private Boolean deleted;

	// Special
	private String _ownerUsername;
	private Integer _ownerRole;
	private String _threadTitle;
	private String _forumId;
	private String _forumTitle;
	private Boolean _allowPosting;
	private Integer _resultForumId;
	private String _resultForumTitle;
	
	// Validation
	public String checkForErrors() {
		
		Thread threadObj = null;
		User ownerObj = null;
		
		if (text == null || (text != null && text.length() > 1000)) {
			return "text";
		}

		if (thread != null) {
			threadObj = new ThreadDAO().findById(thread);
			if (threadObj == null) {
				return "thread";
			}
		}
		
		if (owner != null) {
			ownerObj = new UserDAO().findById(owner);
			if (ownerObj == null) {
				return "owner";
			}
		}
		
		if (deleted == null) {
			return "deleted";
		}
		
		return null;
	}
	
	// Constructors
	
	public Post() {
		super();
		this.deleted = false;
	}
	
	public Post(Integer id, String text, Integer thread, Integer owner, Timestamp date, Boolean deleted,
		String _ownerUsername, Integer _ownerRole, String _threadTitle, String _forumId, String _forumTitle, Boolean _allowPosting,
		Integer _resultForumId, String _resultForumTitle) {
		super();
		this.id = id;
		this.text = text;
		this.thread = thread;
		this.owner = owner;
		this.date = date;
		this.deleted = deleted;
		this._ownerUsername = _ownerUsername;
		this._ownerRole = _ownerRole;
		this._threadTitle = _threadTitle;
		this._forumId = _forumId;
		this._forumTitle = _forumTitle;
		this._allowPosting = _allowPosting;
		this._resultForumId = _resultForumId;
		this._resultForumTitle = _resultForumTitle;
	}

	// Attributes
	
	// Special
	
	@JsonProperty("_forumId")
	public String getForumId() {
		return _forumId;
	}

	public void setForumId(String _forumId) {
		this._forumId = _forumId;
	}
	
	@JsonProperty("_resultForumId")
	public Integer getResultForumId() {
		return _resultForumId;
	}
	
	public void setResultForumId(Integer _resultForumId) {
		this._resultForumId = _resultForumId;
	}
	
	@JsonProperty("_resultForumTitle")
	public String getResultForumTitle() {
		return _resultForumTitle;
	}

	public void setResultForumTitle(String _resultForumTitle) {
		this._resultForumTitle = _resultForumTitle;
	}
	
	@JsonProperty("_ownerUsername")
	public String getOwnerUsername() {
		return _ownerUsername;
	}

	public void setOwnerUsername(String _ownerUsername) {
		this._ownerUsername = _ownerUsername;
	}

	@JsonProperty("_ownerRole")
	public Integer getOwnerRole() {
		return _ownerRole;
	}

	public void setOwnerRole(Integer _ownerRole) {
		this._ownerRole = _ownerRole;
	}

	@JsonProperty("_threadTitle")
	public String getThreadTitle() {
		return _threadTitle;
	}

	public void setThreadTitle(String _threadTitle) {
		this._threadTitle = _threadTitle;
	}

	@JsonProperty("_forumTitle")
	public String getForumTitle() {
		return _forumTitle;
	}

	public void setForumTitle(String _forumTitle) {
		this._forumTitle = _forumTitle;
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

	public String getText()
	{
		return text;
	}

	public void setText(String text)
	{
		this.text = text;
	}

	public Integer getThread()
	{
		return thread;
	}

	public void setThread(Integer thread)
	{
		this.thread = thread;
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

	public Boolean getDeleted()
	{
		return deleted;
	}

	public void setDeleted(Boolean deleted)
	{
		this.deleted = deleted;
	}
	
}
