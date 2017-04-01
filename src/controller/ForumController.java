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
		
    	Integer id = pp.integer("id");
		if (id != null) {
			Forum result = new ForumDAO().findById(id, current.getRole());
			if (result != null)
				if (current.getId() == id) {
					Responder.out(response, result, Views.getPersonal(current));
				} else {
					Responder.out(response, result, Views.forUser(current));
				} else {
					Responder.out(response, "notFound");
				}
		} else {
			ArrayList<Object> results = new ForumDAO().filter(pp, current.getRole());
			Responder.out(response, results, Views.forUser(current));
		}
	}


	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		// First initialize variables
		ParamProcessor pp = new ParamProcessor(request);
		User current = Cookies.getUser(request);
		
		Integer id = pp.integer("id");
		String title = pp.string("title");
		String descript = pp.string("descript");
		Integer parent = pp.integer("parent");
		Integer owner = pp.integer("owner");
		Integer vistype = pp.integer("vistype");
		Boolean locked = pp.bool("locked");
		Boolean deleted = pp.bool("deleted");
		String reqType = pp.string("reqType");
		
		// Done
		
		if (reqType.equals("update")) {
			
			if (id != null && current.isAdmin()) {
				Forum entry = new ForumDAO().findById(id, current.getRole());
				
					new ForumDAO().update(entry);
			}
		}
		
		if (reqType.equals("lock")) {
			if (id != null && current.isAdmin()) {
				Forum entry = new ForumDAO().findById(id, current.getRole());
				if (locked != null) {
					entry.setLocked(locked);
					new ForumDAO().lock(entry, locked);
				}
			}
		}
		
		if (reqType.equals("delete")) {
			if (id != null && current.isAdmin()) {
				Forum entry = new ForumDAO().findById(id, current.getRole());
				if (deleted != null) {
					new ForumDAO().softDelete(entry, (boolean) deleted);
				}
			}
		}
	}
}
