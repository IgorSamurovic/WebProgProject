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
import model.User.Role;
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
		
		if (current == null || !current.isAdmin()) {
			Responder.error(response, "access");
			return;
		}
		
		ForumDAO dao = new ForumDAO();
		
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
		
		// ----------------------------------------------------------------------------------------------------
		// Add

		if (reqType.equals("add")) {
			if (parent != null) {
				Forum forumObj = new ForumDAO().findById(parent, current);
				if (forumObj != null && !forumObj.getDeleted() && forumObj.getAllowPosting()) {
					obj = new Forum();
					obj.setTitle(title);
					obj.setDescript(descript);
					obj.setParent(parent);
					obj.setOwner(owner);
					obj.setVistype(vistype);
			
					error = obj.checkForErrors();
					
					if (error == null) {
						if (dao.insert(obj)) {
							pp.setForLast();
							obj = dao.getFirstForum(dao.filter(pp, current));
							Responder.out(response, obj.getId());
						} else {
							Responder.error(response, "db");
						}
					} else {
						Responder.error(response, error);
					}
				} else {
					Responder.error(response, "access");
				}
			}
			return;
		} 

		// ----------------------------------------------------------------------------------------------------
		// Edit
		
		if (reqType.equals("edit")) {
			if (id != null) {
				obj = dao.findById(id, current);
				
				if (obj != null && !obj.getDeleted()) {
					obj = dao.findById(id, current);
					if (title != null) obj.setTitle(title);
					obj.setDescript(descript);
					if (parent != null) obj.setParent(parent);
					if (owner != null) obj.setOwner(owner);
					if (vistype != null) obj.setVistype(vistype);
					
					error = obj.checkForErrors();
					
					if (error == null) {
						if (dao.update(obj)) {
							
						} else {
							Responder.error(response, "db");
						}
					} else {
						Responder.error(response, error);	
					}
				} else {
					Responder.error(response, "access");
				}
			} else {
				Responder.error(response, "forumid");
			}
			return;
		}
		
		// ----------------------------------------------------------------------------------------------------
		// Lock
		
		if (reqType.equals("lock")) {
			if (id != null && locked != null) {
				obj = dao.findById(id, current);
				if (obj != null && !obj.getDeleted() ) {
					
					obj.setLocked(locked);
					error = obj.checkForErrors();
				
					if (error == null) {
						if (dao.lock(obj, locked)) {
							
						} else {
							Responder.error(response, "db");
						}
					} else {
						Responder.error(response, error);
					}
				} else {
					Responder.error(response, "access");
				}
			} else {
				Responder.error(response, "forumid");
			}
		}
		
		// ----------------------------------------------------------------------------------------------------
		// Del
		
		if (reqType.equals("del")) {
			if (id != null && deleted != null) {
				obj = dao.findById(id, current);
				if (obj != null) {
					
					obj.setDeleted(deleted);
					error = obj.checkForErrors();
				
					if (error == null) {
						if (dao.delete(obj, current, deleted, pp.bool("preferHard"))) {
							
						} else {
							Responder.error(response, "db");
						}
					} else
						Responder.error(response, error);
				} else {
					Responder.error(response, "access");
				}
			} else {
				Responder.error(response, "forumid");
			}
		}
	}
}
