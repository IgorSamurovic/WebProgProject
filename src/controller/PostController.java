package controller;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import controller.util.ParamProcessor;
import controller.util.Responder;
import model.Thread;
import model.Post;
import model.User;
import model.User.Role;
import model.dao.PostDAO;
import model.dao.ThreadDAO;
import util.Cookies;
import views.Views;

public class PostController extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		User current = Cookies.getUser(request);
		ParamProcessor pp = new ParamProcessor(request);
		Responder.out(response, new PostDAO().filter(pp, current), Views.forUser(current));
    }
    
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// First initialize variables
		User current = Cookies.getUser(request);
		PostDAO dao = new PostDAO();
		
		if (current == null || current.isGuest() || current.getBanned()) {
			Responder.error(response, "access");
			System.err.println(current);
			return;
		}
		
		ParamProcessor pp = new ParamProcessor(request);
		Post obj = null;
		String error = "";
		
		Integer id = pp.integer("id");
		String text = pp.string("text");
		Integer thread = pp.integer("thread");
		Integer owner = pp.integer("owner");
		Boolean deleted = pp.bool("deleted");
		
		String reqType = pp.string("reqType");
		//pp.printDebug();
		if (reqType == null) return;
		
		// ----------------------------------------------------------------------------------------------------
		// Add
		
		if (reqType.equals("add")) {
			if (thread != null) {
				Thread threadObj = new ThreadDAO().findById(thread, current);
				System.err.println(threadObj);
				if (threadObj != null && !threadObj.getDeleted() && (
					current.isAdmin() ||
					(!threadObj.getLocked() && threadObj.getAllowPosting())
				)) {	
					if (text != null) {
						text = text.replaceAll("<[^>]*>", "");
					}
					obj = new Post();
					obj.setText(text);
					obj.setThread(thread);
					obj.setOwner(owner);
					
					error = obj.checkForErrors();
		
					if (error == null) {
						if (dao.insert(obj)) {
							pp.setForLast();
							obj = dao.getFirstPost(dao.filter(pp, current));
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
				Responder.error(response, "thread");
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
				Responder.error(response, "postid");
			}
			return;
		}
		
		// ----------------------------------------------------------------------------------------------------
		// Del
		
		if (reqType.equals("del")) {
			if (id != null) {
				obj = dao.findById(id, current);
				if (obj != null && deleted != null && (
					current.isAdmin() ||
					current.isMod() && (obj.getOwner() == current.getId() || obj.getOwnerRole() <= Role.USER) ||
					current.isUser() && obj.getOwner() == current.getId()
				)) {
					obj.setDeleted(deleted);
					error = obj.checkForErrors();
					
					if (error == null) {
						if (dao.delete(obj, current, deleted, pp.bool("preferHard"))) {
							
						} else {
							Responder.error(response, "db");
						}
					} else {
						Responder.error(response, error);
					}
					return;
				} else {
					Responder.error(response, "access");
				}
			} else {
				Responder.error(response, "postid");
			}
			return;
		}
	}
	
}
