package model;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Thread
{
	private Integer id;
	private String title;
	private String descript;
	private String text;
	private Integer forum;
	private Integer owner;
	private Timestamp date;
	private Boolean sticky;
	private Boolean locked;
	private Boolean deleted;
	
	public Thread(Integer id, String title, String descript, String text, Integer forum, Integer owner, Timestamp date, Boolean sticky, Boolean locked, Boolean deleted)
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
	}
	
	public Thread()
	{
		super();
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
