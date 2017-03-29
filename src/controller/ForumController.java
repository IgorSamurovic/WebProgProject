package controller;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import controller.util.ParamProcessor;
import controller.util.Responder;
import model.Forum;
import model.User;
import model.dao.ForumDAO;
import model.dao.UserDAO;
import util.Cookies;
import views.Views;

/**
 * Servlet implementation class ForumController
 */
public class ForumController extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	User current = Cookies.getUser(request);
    	ParamProcessor pp = new ParamProcessor(request);
		
    	// Let's check for singular search
    	Integer id = pp.integer("id");
		if (id != null)
		{
			Forum result = new ForumDAO().findById(id);
			if (result != null)
				if (current.getId() == id)
				{
					Responder.out(response, result, Views.getPersonal(current));
				}
				else
				{
					Responder.out(response, result, Views.forUser(current));
				}
				
			else response.sendError(404, "Forum not found.");
		}
		else
		{
			ArrayList<Object> results = new ForumDAO().filter(pp, current.getRole());
			Responder.out(response, results, Views.forUser(current));
		}
	}


	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		// First initialize variables
		ParamProcessor pp = new ParamProcessor(request);
		
		Integer id = pp.integer("id");
		String title = pp.string("title");
		String descript = pp.string("descript");
		Integer parent = pp.integer("parent");
		Integer owner = pp.integer("owner");
		Integer vistype = pp.integer("vistype");
		Boolean locked = pp.bool("locked");
		Boolean deleted = pp.bool("deleted");
		String reqType = pp.string("reqType");
		
		User current = Cookies.getUser(request);
		
		// Done
		
		if (reqType.equals("update")) {
			
			if (id != null && current.isAdmin()) {
				Forum entry = new ForumDAO().findById(id);
				
					new ForumDAO().update(entry);
			}
		}
	}
}
