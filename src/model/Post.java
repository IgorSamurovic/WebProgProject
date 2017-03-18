package model;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Post
{
	private Integer id;
	private String text;
	private Integer thread;
	private Integer owner;
	private Timestamp date;
	private Boolean deleted;
	
	public Post(Integer id, String text, Integer thread, Integer owner, Timestamp date, Boolean deleted)
	{
		super();
		this.id = id;
		this.text = text;
		this.thread = thread;
		this.owner = owner;
		this.date = date;
		this.deleted = deleted;
	}
	
	public Post()
	{
		super();
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
