package controller.util;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

public class ParamProcessor
{
	private Map<String, String[]> map;
	@SuppressWarnings("unused")
	private static final Pattern INDEX_PATTERN = Pattern.compile("\\[(.*?)\\]");
	
	public void setForLast() {
		add("orderBy", "obj.DATE");
		add("asc", "DESC");
		add("page", "1");
		add("perPage", "1");
	}
	
	public ParamProcessor() {
		this.map = new HashMap<String,String[]>();
	}
	
	@SuppressWarnings("unchecked")
	public ParamProcessor(HttpServletRequest request) {
		this.map = new HashMap<String, String[]>();
		map.putAll(request.getParameterMap());
	}
	
	public ParamProcessor(HashMap<String, String[]> newMap) {
		this.map = newMap;
	}
	
	public void printDebug() {
		System.err.println();
		for (String key : this.map.keySet()) {
			System.err.println(key + " : " + this.map.get(key)[0]);
		}
		System.err.println();
	}
	
	public void add(String key, String value) {
		String[] ary = {value};
		this.map.put(key, ary);
	}
	
	public void add(String key, Object value) {
		String[] ary = {String.valueOf(value)};
		this.map.put(key, ary);
	}
	
	public void remove(String key) {
		this.map.remove(key);
	}
	
	public String get(String key) {
		String[] ary = this.map.get(key);
		return (ary == null) ? null : ary[0];
	}
	
	public Map<String, String[]> getMap() {
		return this.map;
	}
	
	public Boolean bool(String param)
	{
		String test = get(param);
		Boolean val = null;
		
		if (test != null && !test.equals("null") && !test.isEmpty())
			try
			{
				val = !test.toUpperCase().equals("FALSE") && !test.toUpperCase().equals("0") && !test.toUpperCase().equals("NO");
			} catch (Exception e) {};
			
		return val;
	}
	
	public String string(String param)
	{
		try {
			String test = get(param);
			String val = null;
			
			if (test != null && !test.equals("null") && !test.isEmpty()) {
				val = test;
			}
			
			//System.err.println(param + " " + val);
			return val;
		} catch (Exception e) {
			return null;
		}
		
	}
	
	public Timestamp time(String param)
	{
		String test = get(param);
		Timestamp val = null;
		
		if (test != null && !test.equals("null") && !test.isEmpty())
			try
			{
				if (test.length() == 10)
				{
					test += " 00:00:00";
				}
				else if (test.length() == 16)
				{
					test += ":00";
				}
				
				test = test.replace("T", " ");
				val = Timestamp.valueOf(test);
				
			} catch (Exception e) {};
			
		return val;
	}
	
	public Integer integer(String param)
	{
		String test = get(param);
		Integer val = null;
		
		if (test != null && !test.equals("null") && !test.isEmpty())
		{
			try
			{
				val = Integer.parseInt(test);
				
			} catch (Exception e) {};
		}
		
		return val;
	}
	
}
