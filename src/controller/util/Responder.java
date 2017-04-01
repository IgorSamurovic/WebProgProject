package controller.util;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

public class Responder
{
	public static boolean out(HttpServletResponse response, Object obj, @SuppressWarnings("rawtypes") Class cls)
	{
		ObjectWriter ow = new ObjectMapper().writer().withView(cls);
		String mapperdata;
		try {
			mapperdata = ow.writeValueAsString(obj);
			response.getWriter().print(mapperdata);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return false;
	}
	
	public static boolean out(HttpServletResponse response, String txt) {
		try {
			response.getWriter().print(txt);
			return true;
		} catch (IOException e) {
			e.printStackTrace();
		}
		return false;
	}

}
