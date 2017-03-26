package model.dao.util;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

public class QueryBuilder
{
	private String query;
	private String start;
	
	private ArrayList<Object> params;
	private ArrayList<Boolean> inexact;
	
	private boolean alreadySorting;
	private Connection conn;
	private boolean hasArgs;
	
	private String andString()
	{
		return hasArgs ? " AND " : " WHERE ";
	}
	
	private String orderByString()
	{
		return alreadySorting ? " , " : " ORDER BY ";
	}
	
	public QueryBuilder()
	{
		this.params = new ArrayList<Object>();
		this.inexact = new ArrayList<Boolean>();
		this.query = "";
		this.start = "";
		this.hasArgs = false;
		this.alreadySorting = false;
	}
	
	public QueryBuilder setStart(String start)
	{
		this.start = start;
		return this;
	}
	
	private void addParam(Object obj, Boolean inexact)
	{
		this.params.add(obj);
		this.inexact.add(inexact);
	}
	
	private void addParam(Object obj)
	{
		this.params.add(obj);
		this.inexact.add(false);
	}
	
	public String getQuery()
	{
		return this.start + " " + this.query;
	}
	
	public QueryBuilder and(Object o, String part)
	{
		if (o != null)
		{
			query += andString();
			query += part;
			addParam(o, part.toUpperCase().contains("LIKE"));
			hasArgs = true;
		}
		
		return this;
	}
	
	public QueryBuilder and(Object o, String part, String alternative)
	{
		if (o != null)
		{
			query += andString();
			query += part;
			addParam(o, part.toUpperCase().contains("LIKE"));
			hasArgs = true;
		}
		else
		{
			query += andString();
			query += alternative;
			hasArgs = true;
		}
		
		return this;
	}
	
	public QueryBuilder and(String part)
	{
		query += andString();
		query += part;
		hasArgs = true;
		return this;
	}
	
	public void processStatement(PreparedStatement stmt) throws Exception
	{
		for (int i = 0; i < params.size(); i++)
		{
			
			if (!inexact.get(i))
			{
				stmt.setObject(i+1, params.get(i));
			}
			else
			{
				stmt.setObject(i+1, "%" + (String) params.get(i) + "%");
			}

		}
	}
	
	public ResultSet getResultSet()
	{
		try 
		{
			this.conn = Connector.get();
			PreparedStatement stmt = conn.prepareStatement(getQuery());
			processStatement(stmt);
			stmt.execute();
			return stmt.getResultSet();
		} catch (Exception e) {e.printStackTrace();}
		return null;
	}
	
	public void close()
	{
		try
		{
			this.conn.close();
		} catch (Exception e) {e.printStackTrace();}
	}
	
	public QueryBuilder orderBy(String orderBy, String asc)
	{
		if (orderBy != null && orderBy.matches("[A-Za-z]{1,20}"))
		{
			query += orderByString() + orderBy;
			if (asc != null && (asc.toUpperCase().equals("ASC") || asc.toUpperCase().equals("DESC")))
				query += " " + asc;
			return this;	
		}
		return this;
	}
	
	static final int MAX_PER_PAGE = 50;
	static final int DEFAULT_PER_PAGE = 10;
	
	public QueryBuilder limit(Integer page, Integer perPage)
	{
		if (page == null || page <= 0) {
			page = 1;
		}
		
		if (perPage == null) {
			perPage = DEFAULT_PER_PAGE;
		} else if (perPage <= 0) {
			perPage = DEFAULT_PER_PAGE;
		} else if (perPage > MAX_PER_PAGE) {
			perPage = MAX_PER_PAGE;
		}
		
		Integer startFrom = Math.max(0, page-1) * perPage;
		
		query += " LIMIT ?, ?";
	
		if (startFrom != null && startFrom >= 0)
			addParam(startFrom);
		else
			addParam(0);

		if (perPage != null && perPage <= MAX_PER_PAGE)
			addParam(perPage);
		else
			addParam(DEFAULT_PER_PAGE);
		
		return this;
	}
	
	public void end()
	{
		query += ";";
	}

}
