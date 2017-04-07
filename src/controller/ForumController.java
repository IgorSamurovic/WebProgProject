package controller;

import java.io.IOException;
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
    	Responder.out(response, new ForumDAO().filter(pp, current), Views.forUser(current));
	}

	@SuppressWarnings("unchecked")
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		// First initialize variables
		User current = Cookies.getUser(request);
		if (!current.isAdmin()) {
			Responder.out(response, "ACCESS DENIED");
			return;
		}
		
		ParamProcessor pp = new ParamProcessor(request);
		Forum obj = null;
		String error = "";
		
		Integer id = pp.integer("id");
		String title = pp.string("title");
		String descript = pp.string("descript");
		Integer parent = pp.integer("parent");
		Integer owner = pp.integer("owner");
		Integer vistype = pp.integer("vistype");
		Boolean locked = pp.bool("locked");
		Boolean deleted = pp.bool("deleted");
		String reqType = pp.string("reqType");
		
		if (reqType == null) return;
		
		// Done

		if (reqType.equals("add")) {
			obj = new Forum();
			obj.setTitle(title);
			obj.setDescript(descript);
			obj.setParent(parent);
			obj.setOwner(owner);
			obj.setVistype(vistype);
			
			error = obj.checkForErrors();
			pp.printDebug();


			if (error != null) {
				Responder.out(response, error);
				return;
			}
			
			new ForumDAO().insert(obj);
			pp.setForLast();
			obj = ((ArrayList<Forum>) new ForumDAO().filter(pp, current).get(1)).get(0);
			Responder.out(response, Integer.toString(obj.getId()));
		} 

		if (reqType.equals("edit")) {
			obj = new ForumDAO().findById(id);
			if (title != null) obj.setTitle(title);
			obj.setDescript(descript);
			if (parent != null) obj.setParent(parent);
			if (owner != null) obj.setOwner(owner);
			if (vistype != null) obj.setVistype(vistype);
			
			error = obj.checkForErrors();
			
			if (error != null) {
				Responder.out(response, error);
				return;
			}
			//currenSystem.err.println(obj);
			new ForumDAO().update(obj);
		}
		
		if (reqType.equals("lock")) {
			if (id != null && locked != null) {
				obj = new ForumDAO().findById(id, current);
				obj.setLocked(locked);
				
				error = obj.checkForErrors();
				
				if (error != null) {
					Responder.out(response, error);
					return;
				}
				
				new ForumDAO().lock(obj, locked);
			}
		}
		
		if (reqType.equals("del")) {
			if (id != null) {
				if (deleted != null) {
					obj = new ForumDAO().findById(id);
					
					obj.setDeleted(deleted);
					error = obj.checkForErrors();
					
					if (error != null) {
						Responder.out(response, error);
						return;
					}
					
					new ForumDAO().delete(obj, current, deleted, pp.bool("preferHard"));
				}
			}
		}
	}
}
