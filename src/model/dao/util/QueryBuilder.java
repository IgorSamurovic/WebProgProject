package model.dao.util;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import controller.util.ParamProcessor;
import model.User;

public class QueryBuilder
{
	private static final String PARAM_PATTERN_STRING = "\\$[^\\s]+";
	private static final Pattern PARAM_PATTERN = Pattern.compile(PARAM_PATTERN_STRING);
	
	private String query;
	private String start;
	private String join;
	
	private ArrayList<Object> params;
	private ArrayList<Boolean> inexact;
	
	private boolean alreadySorting;
	private Connection conn;
	private boolean hasArgs;
	ParamProcessor pp;
	
	public String checkTable(String orderBy, String[] tables) {
		System.err.println(orderBy);
		System.err.println(tables);
		String fix = tables[0];
		if (orderBy == null)
			return fix;
		orderBy = orderBy.toLowerCase();
		ArrayList<String> valid = new ArrayList<String>(Arrays.asList(tables));

		return orderBy != null && valid.contains(orderBy) ? orderBy : fix;
	}
	
	private Integer numRecords;
	
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
		this.numRecords = 0;
		this.pp = null;
		this.join = "";
	}
	
	public QueryBuilder(ParamProcessor pp) {
		this();
		this.pp = pp;
	}
	
	public QueryBuilder setStart(String start)
	{
		this.start = start;
		return this;
	}
	
	public QueryBuilder setJoin(String join)
	{
		this.join = join;
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
		return this.start + " " + this.join + " " + this.query;
	}
	
	// Checks if a string has $something at the start, then returns the something value
	// From the parameter processor
	private String prep(String part) {
		if (part != null && part.charAt(0) == '$' && this.pp != null) {
			//System.err.println("prep: " + part.substring(1, part.length()));
			return this.pp.string(part.substring(1, part.length()));
		}
		return part;
	}
	
	// Goes through a string (like "id = $id") and replaces $id with ?
	// Also adds $id values from parameter processor to the stack
	private String processPart(String part) {

		boolean proper = true;
		//System.err.println("PART!!!!!!!  " + part);
		String tmp;
		Matcher m = PARAM_PATTERN.matcher(part);
		
		while (m.find()) {
			tmp = prep(m.group(0));
			//System.err.println("TMP!!!!!!!!  " + tmp);
		    if (tmp == null) {
		    	proper = false;
		    } else {
		    	if (part.contains("LIKE")) {
		    		addParam(tmp, true);
		    	} else {
		    		addParam(tmp);
		    	}
		    }
		}
		
		return proper ? part.replaceAll(PARAM_PATTERN_STRING, " ? ") : null;
	}
	
	// "id = ?", id
	public QueryBuilder and(String part, Object o) {
		//System.err.println("PART: " + part);
		
		part = processPart(part);
		if (part != null && o != null) {
			query += andString();
			query += part;
			addParam(o, part.toUpperCase().contains("LIKE"));
			hasArgs = true;
		}
		//System.err.println();
		return this;
	}
	
	// "id = ?", "id = 0", id
	public QueryBuilder and(String part, String alternative, Object o) {
		if (o != null) {
			part = processPart(part);
			if (part != null) { 
				query += andString();
				query += part;
				addParam(o, part.toUpperCase().contains("LIKE"));
				hasArgs = true;
			}
		} else {
			processPart(alternative);
			if (alternative != null) { 
				query += andString();
				query += alternative;
				hasArgs = true;
			}
		}
		
		return this;
	}

	// and("id = $id")
	public QueryBuilder and(String part) {
		part = processPart(part);
		//System.err.println("PART!FIXED!  " + part);
		if (part != null) {
			query += andString();
			query += part;
			hasArgs = true;
		}
		//System.err.println();
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
	
	public QueryBuilder orderBy(String orderBy, String asc, String[] tables) {
		orderBy = prep(orderBy);
		asc = prep(asc);
		return this.orderBy(checkTable(orderBy, tables), asc);
	}
	
	public QueryBuilder orderBy(String orderBy, String asc) {
		orderBy = prep(orderBy);
		asc = prep(asc);
		
		if (orderBy == null) orderBy = "ID";
		if (asc == null) asc = "TRUE";
		
		if (orderBy != null) {
			query += orderByString() + orderBy;
			if (asc != null && !asc.equals("")) {
				asc = asc.toUpperCase();
				if (asc.equals("TRUE") || asc.equals("ASC")) {
					asc = "ASC";
					query += " " + asc;
				} else if (asc.equals("FALSE") || asc.equals("DESC")) {
					asc = "DESC";
					query += " " + asc;
				}
			}
			this.alreadySorting = true;
		}
		
		return this;
	}
	
	static final int MAX_PER_PAGE = 50;
	static final int DEFAULT_PER_PAGE = 10;
	
	public Integer getNumRecords()
	{
		try
		{
			ResultSet rs = this.getResultSet();
			if(rs.next()) {
				this.numRecords = rs.getInt("COUNT(obj.id)");
				return numRecords;
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		finally
		{
			this.close();
		}
		return null;
	}
	
	private Integer getNumPages(Integer perPage) {
		return this.numRecords / perPage + ((this.numRecords % perPage > 0) ? 1 : 0);
	}
	
	private static int[] perPageValues = {1, 5, 10, 20, 50};
	
	public QueryBuilder limit(String page, String perPage) {
		try {
			limit(Integer.valueOf(prep(page)), Integer.valueOf(prep(perPage)));
		} catch (Exception e) {
			limit(1, 10);
		}
		return this;
	}
	
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
		} else {
			boolean found = false;
			for (int i=0; i<perPageValues.length; i++) {
				if (perPage == perPageValues[i]) found = true;
			}
			if (!found) perPage = DEFAULT_PER_PAGE;
		}

		Integer numPages = this.getNumPages(perPage);
		
		if (page > numPages) {
			page = numPages;
		}
		
		Integer startFrom = (page-1) * perPage;
		
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
