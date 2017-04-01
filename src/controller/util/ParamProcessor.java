package controller.util;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

public class ParamProcessor
{
	private HttpServletRequest request;
	private Map<String, String[]> map;
	private static final Pattern INDEX_PATTERN = Pattern.compile("\\[(.*?)\\]");
	
	public ParamProcessor(HttpServletRequest request)
	{
		this.request = request;
		this.map = request.getParameterMap();
		for (String key : this.map.keySet()) {
			//System.err.println(key + " : " + this.map.get(key)[0]);
		}
	}
	
	public Boolean bool(String param)
	{
		String test = request.getParameter(param);
		Boolean val = null;
		
		if (test != null && !test.equals("null") && !test.isEmpty())
			try
			{
				val = !test.toUpperCase().equals("FALSE") && !test.toUpperCase().equals("0") && !test.toUpperCase().equals("NO");
			} catch (Exception e) {};
			
		return val;
	}
	
	private int getIndex(String param) {
		Matcher m = INDEX_PATTERN.matcher(param);
		String matcher = "";
		while (m.find()) {
		    matcher = m.group(1);
		}
		try {
			return (matcher == null || matcher.length() <= 0) ? 0 : Integer.valueOf(m.group(1));
		} catch (Exception e) {
			return 0;
		}
	}
	
	private String getTestString(String param) {
		return this.map.get(param)[this.getIndex(param)];
	}
	
	public String string(String param)
	{
		try {
			//String test = request.getParameter(param);
			String test = getTestString(param);
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
		String test = request.getParameter(param);
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
		String test = request.getParameter(param);
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

	public Map<String, String[]> getMap() {
		return this.map;
	}
	
}
