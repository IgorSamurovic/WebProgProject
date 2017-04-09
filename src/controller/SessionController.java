package controller;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;

import controller.util.ParamProcessor;
import controller.util.Responder;
import model.User;
import model.dao.UserDAO;
import util.Cookies;

public class SessionController extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		response.getWriter().print(Cookies.getUser(request));
	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		// Handles the login request
		ParamProcessor p = new ParamProcessor(request);
		String entry = p.string("entry");
		String password = p.string("password");
		
		if (entry != null && password != null)
		{
			User match = new UserDAO().validate(entry, password);
			if (match != null)
			{
				String mapperdata = new ObjectMapper().writeValueAsString(match);
				response.addCookie(new Cookie("user", mapperdata));
				response.addCookie(new Cookie("userid", String.valueOf(match.getId())));
				response.addCookie(new Cookie("role", String.valueOf(match.getRole())));
			}
			else
			{
				Responder.error(response, "login");
			}
		}
		else
		{
			Responder.error(response, "login");
		}
	}
	
	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		for (Cookie c : request.getCookies())
		{
			c.setMaxAge(0);
			c.setValue("");
			response.addCookie(c);
		}
	}
	
}
