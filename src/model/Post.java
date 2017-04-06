package model;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Post implements DataObject
{
	private Integer id;
	private String text;
	private Integer thread;
	private Integer owner;
	private Timestamp date;
	private Boolean deleted;

	private String ownerUsername;
	private Integer ownerRole;
	private String threadTitle;
	private String forumTitle;
	
	public Post(Integer id, String text, Integer thread, Integer owner, Timestamp date, Boolean deleted,
			String ownerUsername, Integer ownerRole, String threadTitle, String forumTitle) {
		super();
		this.id = id;
		this.text = text;
		this.thread = thread;
		this.owner = owner;
		this.date = date;
		this.deleted = deleted;
		this.ownerUsername = ownerUsername;
		this.ownerRole = ownerRole;
		this.threadTitle = threadTitle;
		this.forumTitle = forumTitle;
	}
	
	public Post()
	{
		super();
		this.deleted = false;
	}

	// Special attributes
	
	@JsonProperty("_ownerUsername")
	public String getOwnerUsername() {
		return ownerUsername;
	}

	public void setOwnerUsername(String ownerUsername) {
		this.ownerUsername = ownerUsername;
	}

	@JsonProperty("_ownerRole")
	public Integer getOwnerRole() {
		return ownerRole;
	}

	public void setOwnerRole(Integer ownerRole) {
		this.ownerRole = ownerRole;
	}

	@JsonProperty("_threadTitle")
	public String getThreadTitle() {
		return threadTitle;
	}

	public void setThreadTitle(String threadTitle) {
		this.threadTitle = threadTitle;
	}

	@JsonProperty("_forumTitle")
	public String getForumTitle() {
		return forumTitle;
	}

	public void setForumTitle(String forumTitle) {
		this.forumTitle = forumTitle;
	}
	
	// Boring attributes
	
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
