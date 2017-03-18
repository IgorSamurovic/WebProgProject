package util;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import model.User;
import model.dao.UserDAO;

public class Cookies
{

	public static Cookie get(HttpServletRequest request, String name)
	{
		if (request != null)
		{
			Cookie[] cookies = request.getCookies();
		
			if (cookies != null && cookies.length > 0)
			{
				for (Cookie cookie: cookies)
				{
					if (cookie.getName().equals(name) && !cookie.getValue().equals(""))
					{
						return cookie;
					}
				}
			}
		}
		return null;
		
	}
	
	public static User getUser(HttpServletRequest request)
	{
		User user = null;
		if (request != null)
		{
			Cookie cookie = get(request, "userid");
			if (cookie != null && !cookie.equals(""))
			{
				return new UserDAO().findById(Integer.valueOf(cookie.getValue()), User.Role.ADMIN);
			}
			else
			{
				user = new User();
				user.setUsername("Guest");
				user.setRole(0);
				return user;
			}
		}
		return null;
	}


}
