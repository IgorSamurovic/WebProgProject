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
import model.Thread;
import model.User;
import model.User.Role;
import model.dao.ForumDAO;
import model.dao.ThreadDAO;
import util.Cookies;
import views.Views;

public class ThreadController extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		User current = Cookies.getUser(request);
		ParamProcessor pp = new ParamProcessor(request);
		Responder.out(response, new ThreadDAO().filter(pp, current), Views.forUser(current));
    }
    
	@SuppressWarnings("unchecked")
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		// First initialize variables
		User current = Cookies.getUser(request);
		ThreadDAO dao = new ThreadDAO();
		
		if (current == null || current.isGuest()) {
			Responder.error(response, "access");
			return;
		}
		
		ParamProcessor pp = new ParamProcessor(request);
		Thread obj = null;
		String error = "";
		
		Integer id = pp.integer("id");
		String title = pp.string("title");
		String descript = pp.string("descript");
		String text = pp.string("text");
		Integer forum = pp.integer("forum");
		Integer owner = pp.integer("owner");
		Boolean sticky = pp.bool("sticky");
		Boolean locked = pp.bool("locked");
		Boolean deleted = pp.bool("deleted");
		
		String reqType = pp.string("reqType");
		//pp.printDebug();
		if (reqType == null) return;
		
		// ----------------------------------------------------------------------------------------------------
		// Add
		
		if (reqType.equals("add")) {
			if (forum != null) {
				Forum forumObj = new ForumDAO().findById(forum, current);
				if (forumObj != null && !forumObj.getDeleted() && forumObj.getAllowPosting() && (
						current.isAdmin() ||
						current.isMod() || 
						current.isUser() || !forumObj.getLocked()
				)) {
					if (text != null) {
						text = text.replaceAll("<[^>]*>", "");
					}
					
					obj = new Thread();
					obj.setTitle(title);
					obj.setDescript(descript);
					obj.setText(text);
					obj.setForum(forum);
					obj.setOwner(owner);
		
					error = obj.checkForErrors();
					
					if (error == null) {
						if (dao.insert(obj)) {
							pp.setForLast();
							obj = dao.getFirstThread(dao.filter(pp, current)); 
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
			} else {
				Responder.error(response, "access");
			}
		} 

		// ----------------------------------------------------------------------------------------------------
		// Edit
		
		if (reqType.equals("edit")) {
			if (id != null) {
				obj = dao.findById(id, current);
				
				if (obj != null && !obj.getDeleted() && (
					current.isAdmin() ||
					current.isMod() && (obj.getOwner() == current.getId() || obj.getOwnerRole() <= Role.USER) ||
					current.isUser() && obj.getOwner() == current.getId() && obj.getAllowPosting()
				)) {
					
					if (text != null) {
						text = text.replaceAll("<[^>]*>", "");
					}
					if (forum != null) obj.setForum(forum);
					obj.setTitle(title);
					obj.setDescript(descript);
					obj.setText(text);
					
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
				Responder.error(response, "threadid");
			}
			return;
		}
			
		// ----------------------------------------------------------------------------------------------------
		// Stick
		
		if (reqType.equals("stick")) {
			if (id != null && sticky != null) {
				obj = dao.findById(id, current);
				if (obj != null && !obj.getDeleted() && (
					current.isAdmin() ||
					current.isMod() && (obj.getOwner() == current.getId() || obj.getOwnerRole() <= Role.USER)
				)) {
					
					obj.setSticky(sticky);
					error = obj.checkForErrors();
					
					if (error == null) {
						if (dao.stick(obj, sticky)) {
							
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
				Responder.error(response, "threadid");
			}
		}
		
		// ----------------------------------------------------------------------------------------------------
		// Lock
		
		if (reqType.equals("lock")) {
			if (id != null && locked != null) {
				obj = dao.findById(id, current);
				if (obj != null && !obj.getDeleted() && (
					current.isAdmin() ||
					current.isMod() && (obj.getOwner() == current.getId() || obj.getOwnerRole() <= Role.USER)
				)) {
					
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
				Responder.error(response, "threadid");
			}
		}
		
		// ----------------------------------------------------------------------------------------------------
		// Del
		
		if (reqType.equals("del")) {
			if (id != null && deleted != null) {
				obj = dao.findById(id, current);
				if (obj != null && (
					current.isAdmin() ||
					current.isMod() && (obj.getOwner() == current.getId() || obj.getOwnerRole() <= Role.USER)
				)) {
					
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
				Responder.error(response, "threadid");
			}
		}
	}
	
}
