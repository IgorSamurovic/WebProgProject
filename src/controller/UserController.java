package controller;

import java.io.IOException;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import controller.util.ParamProcessor;
import controller.util.Responder;
import model.User;
import model.dao.UserDAO;
import util.Cookies;
import views.Views;

public class UserController extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
    	User current = Cookies.getUser(request);
    	ParamProcessor pp = new ParamProcessor(request);
		
    	// Let's check for singular search
    	Integer id = pp.integer("id");
		if (id != null)
		{
			User result = new UserDAO().findById(id, current.getRole());
			if (result != null)
				if (current.getId().equals(id))
				{
					Responder.out(response, result, Views.getPersonal(current));
				}
				else
				{
					Responder.out(response, result, Views.forUser(current));
				}
				
			else response.sendError(404, "User not found.");
		}
		else
		{
			ArrayList<Object> results = new UserDAO().filter(pp, current.getRole());
			Responder.out(response, results, Views.forUser(current));
		}
	}

    
    private String getProblems(User entry)
    {
    	// Just for the record, a return value of null means everything is fine
    	try
    	{
        	if (!entry.getUsername().matches("[a-zA-Z0-9_]{3,20}"))
        		return "Username can only contain between 3 and 20 alphanumeric characters.";
        	
        	if (!entry.getPassword().matches(".{6,20}"))
        		return "Password must be between 6 and 20 characters long.";
        	
        	if (!entry.getEmail().matches(".*@.*"))
        		return "Email address needs to be written in the proper \"something@somewhere\" format and have a maximum of 60 characters.";
        	
        	if (entry.getName() != null && !entry.getName().matches(".{0,40}"))
        		return "Maximum name length is 40 characters.";
    		
        	if (entry.getSurname() != null && !entry.getSurname().matches(".{0,40}"))
        		return "Maximum surname length is 40 characters.";
    	}
    	catch (Exception e)
    	{
    		return "Please fill out all required (*) fields.";
    	}

    	return null;
    }
    
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		ParamProcessor pp = new ParamProcessor(request);
		
		Integer id = pp.integer("id");
		String username = pp.string("username");
		String email = pp.string("email");
		String name = pp.string("name");
		String surname = pp.string("surname");
		String password = pp.string("password");
		Integer role = pp.integer("role");
		Boolean banned = pp.bool("banned");
		Boolean deleted = pp.bool("deleted");
		String reqType = pp.string("reqType");
		
		User current = Cookies.getUser(request);
		
		if (reqType.equals("register"))
		{
			if (current.isGuest())
			{
				User entry = new User();
				entry.setUsername(username);
				entry.setEmail(email);
				entry.setName(name);	
				entry.setSurname(surname);
				entry.setPassword(password);
				entry.setRole(1);
				
				String unique = new UserDAO().checkUnique(entry);
				
				if (unique == null)
				{
					String problems = getProblems(entry);
					if (problems == null)
					{
						new UserDAO().insert(entry);
						response.getWriter().print(new UserDAO().findByUsername(username).getId());
					}
					else
					{
						response.getWriter().print("error");
					}
				}
				else
				{
					response.getWriter().print("error");
				}
			}
		}
		
		else if (reqType.equals("insert"))
		{
			if (current.getRole() >= 2)
			{
				User entry = new User();
				entry.setUsername(username);
				entry.setEmail(email);
				entry.setName(name);	
				entry.setSurname(surname);
				entry.setPassword("password");
				String problems = getProblems(entry);
				
				if (problems == null)
				{
					new UserDAO().insert(entry);
					response.getWriter().print("User " + username + "successfully created!");
				}
				else
				{
					response.getWriter().print(problems);
				}
			}
			else
			{
				response.sendError(401);
			}
			
		}
		
		else if (reqType.equals("update"))
		{
			if (id != null && current.getId() != null && (id.equals(current.getId()) || current.getRole() >= User.Role.ADMIN))
			{
				User entry = new UserDAO().findById(id, current.getRole());
				User emailCheck = null;
				
				if (email != null)
				{
					entry.setEmail(email);
					emailCheck = new UserDAO().findByEmail(email);
				}
				
				entry.setName(name);	
				entry.setSurname(surname);
				
				if (id == current.getId())
				{
					if (password != null) entry.setPassword(password);
				}
				
				if (current.getRole() >= User.Role.ADMIN)
				{
					if (role != null) entry.setRole(role);
				}
		
				response.getWriter().print("email");
				
				if (emailCheck == null || emailCheck.getId().equals(entry.getId()))
				{
					new UserDAO().update(entry);
					response.getWriter().print("ok");
				}
				else
				{
					
					
				}
					

			}
			else
			{
				response.sendError(401);
			}
		} 
		
		else if (reqType.equals("ban"))
		{
			if (id != null && current.getId() != null && current.getRole() >= User.Role.ADMIN && banned != null)
			{
				User entry = new UserDAO().findById(id, current.getRole());
				entry.setBanned(banned);
				
				new UserDAO().update(entry);
				response.getWriter().print("You have successfully (un)banned, " + username + "!");
			}
			else
			{
				response.sendError(401);
			}
		}
		
		else if (reqType.equals("delete"))
		{
			if (current.getRole() < User.Role.ADMIN)
			{
				response.sendError(401);
				return;
			};
			
			User toDelete = null;
			
			if (id != null)
				toDelete = new UserDAO().findById(id, current.getRole());
			
			if (id != null && current.getId() != null && current.getRole() >= User.Role.ADMIN && deleted != null && toDelete != null)
				if (current.getRole() >= User.Role.ADMIN)
				{
					//new UserDAO().hardDelete(toDelete);
					new UserDAO().softDelete(toDelete, deleted);
				}
				else
				{
					new UserDAO().softDelete(toDelete, deleted);
				}
			else
			{
				response.sendError(400);
				return;
			}
		}
		
	}
	
}
