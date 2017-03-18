package security.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import model.User;
import settings.Settings;
import util.Cookies;

public class UserFilter implements Filter

{
public void doFilter(ServletRequest arg0, ServletResponse arg1, FilterChain arg2) throws IOException, ServletException
    {
        HttpServletRequest request = (HttpServletRequest) arg0;
        HttpServletResponse response = (HttpServletResponse) arg1;
        if (Cookies.getUser(request).getRole() < User.Role.USER)
        {
            response.sendRedirect(Settings.getHomepage());
            return;
        }
        arg2.doFilter(request, response);
    }

@Override
public void destroy() {
	// TODO Auto-generated method stub
	
}

@Override
public void init(FilterConfig arg0) throws ServletException {
	// TODO Auto-generated method stub
	
}

}