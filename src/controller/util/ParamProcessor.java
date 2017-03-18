package controller.util;

import java.sql.Timestamp;

import javax.servlet.http.HttpServletRequest;

public class ParamProcessor
{
	private HttpServletRequest request;
	
	public ParamProcessor(HttpServletRequest request)
	{
		this.request = request;
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
	
	public String string(String param)
	{
		String test = request.getParameter(param);
		
		String val = null;
		if (test != null && !test.equals("null") && !test.isEmpty())
			val = test;
		
		return val;
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

}
