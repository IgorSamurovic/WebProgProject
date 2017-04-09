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
import model.dao.ThreadDAO;
import model.dao.UserDAO;
import util.Cookies;
import views.Views;

public class UserController extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		User current = Cookies.getUser(request);
		ParamProcessor pp = new ParamProcessor(request);
		Responder.out(response, new UserDAO().filter(pp, current), Views.forUser(current));
    }
    
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		ParamProcessor pp = new ParamProcessor(request);
		User current = Cookies.getUser(request);
		UserDAO dao = new UserDAO();
		User obj;
		String error;
		
		Integer id = pp.integer("id");
		String reqType = pp.string("reqType");
		
		if (current == null || !(
				current.isAdmin() || 
				(current.isMod() && current.getId() == id) ||
				(current.isUser() && current.getId() == id) ||
				(current.isGuest() && reqType.equals("register"))
		)) {
			Responder.error(response, "access");
			return;
		}
		
		String username = pp.string("username");
		String email = pp.string("email");
		String name = pp.string("name");
		String surname = pp.string("surname");
		String password = pp.string("password");
		String confirmPassword = pp.string("confirmPassword");
		Integer role = pp.integer("role");
		Boolean banned = pp.bool("banned");
		Boolean deleted = pp.bool("deleted");
		
		if (reqType == null) return;
		
		if (reqType.equals("register")) {
			if (current.isGuest()) {
				obj = new User();
				obj.setUsername(username);
				obj.setEmail(email);
				obj.setName(name);	
				obj.setSurname(surname);
				obj.setPassword(password);
				obj.setRole(1);
				
				String unique = dao.checkUnique(obj);
				
				if (unique == null) {
					String problems = obj.checkForErrors();
					if (problems == null) {
						dao.insert(obj);
						response.getWriter().print(dao.findByUsername(username, current).getId());
					} else {
						response.getWriter().print("error");
					}
				} else {
					response.getWriter().print("error");
				}
			}
		}
		
		// ----------------------------------------------------------------------------------------------------
		// Add
		
		if (reqType.equals("add")) {
			if (current.isAdmin()) {
				obj = new User();
				obj.setUsername(username);
				obj.setEmail(email);
				obj.setName(name);	
				obj.setSurname(surname);
			
				if (password != null && confirmPassword != null && password.equals(confirmPassword)) {
					obj.setPassword("password");
				} else {
					Responder.error(response, "password");
					return;
				}
				
				obj.setRole(role);
				
				error = obj.checkForErrors();
				
				if (error == null) {
					error = dao.checkUnique(obj);
					if (error == null) {
						if (dao.insert(obj)) {
							pp.setForLast();
							obj = dao.getFirstUser(dao.filter(pp, current));
							Responder.out(response, obj.getId());
						} else {
							Responder.error(response, "db");
						}
					} else {
						Responder.error(response, error);
					}
				} else {
					Responder.error(response, error);
				}
			} else {
				Responder.error(response, "access");
			}

			return;
		} 
		
		// ----------------------------------------------------------------------------------------------------
		// Edit
		
		if (reqType.equals("edit")) {
			if (id != null && (current.isAdmin() || current.getId() == id)) {
				obj = dao.findById(id, current);

				if (obj != null && !obj.getDeleted()) {
					if (email != null) obj.setEmail(email);
					obj.setName(name);
					obj.setSurname(surname);
					
					if (password != null && confirmPassword != null) {
						if (password.equals(confirmPassword)) {
							obj.setPassword(password);
						} else {
							Responder.error(response, "confirm");
							return;
						}
					} else if ((password == null && confirmPassword != null) ||
					(confirmPassword == null && password != null)) {
						Responder.error(response, "confirm");
						return;
					}
					
					if (role != null) obj.setRole(role);
					
					error = obj.checkForErrors();
					
					if (error == null) {
						error = null;
						
						User emailUser = dao.findByEmail(email);
						if (emailUser != null && emailUser.getId() != id) {
							error = "email";
						}
						
						if (error == null) {	
							if (dao.update(obj)) {
								
							} else {
								Responder.error(response, "db");
							}
						} else {
							Responder.error(response, error);
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
		// Ban
		
		if (reqType.equals("ban")) {
			if (id != null && banned != null) {
				obj = dao.findById(id, current);
				if (obj != null && !obj.getDeleted() ) {
					
					obj.setBanned(banned);
					error = obj.checkForErrors();
				
					if (error == null) {
						if (dao.ban(obj, banned)) {
							
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
