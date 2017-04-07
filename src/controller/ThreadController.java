package controller;

import java.io.IOException;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


import controller.util.ParamProcessor;
import controller.util.Responder;
import model.Thread;
import model.User;
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
		
		// Done
		if (reqType.equals("add")) {
			obj = new Thread();
			obj.setTitle(title);
			obj.setDescript(descript);
			obj.setText(text);
			obj.setForum(forum);
			obj.setOwner(owner);
			
			error = obj.checkForErrors();
			pp.printDebug();

			if (error != null) {
				Responder.out(response, error);
				return;
			}
			
			new ThreadDAO().insert(obj);
			pp.setForLast();
			obj = ((ArrayList<Thread>) new ThreadDAO().filter(pp, current).get(1)).get(0);
			Responder.out(response, Integer.toString(obj.getId()));
		} 

		if (reqType.equals("edit")) {
			obj = new ThreadDAO().findById(id);
			obj.setTitle(title);
			obj.setDescript(descript);
			obj.setText(text);
			
			error = obj.checkForErrors();
			
			if (error != null) {
				Responder.out(response, error);
				return;
			}
			//currenSystem.err.println(obj);
			new ThreadDAO().update(obj);
		}
		
		if (reqType.equals("stick")) {
			if (id != null && sticky != null) {
				obj = new ThreadDAO().findById(id);
				obj.setSticky(sticky);
				
				error = obj.checkForErrors();
				
				if (error != null) {
					Responder.out(response, error);
					return;
				}
				
				new ThreadDAO().stick(obj, sticky);
			}
		}
		
		if (reqType.equals("lock")) {
			if (id != null && locked != null) {
				obj = new ThreadDAO().findById(id);
				obj.setLocked(locked);
				
				error = obj.checkForErrors();
				
				if (error != null) {
					Responder.out(response, error);
					return;
				}
				
				new ThreadDAO().lock(obj, locked);
			}
		}
		
		if (reqType.equals("del")) {
			if (id != null) {
				if (deleted != null) {
					obj = new ThreadDAO().findById(id);
					
					obj.setDeleted(deleted);
					error = obj.checkForErrors();
					
					if (error != null) {
						Responder.out(response, error);
						return;
					}
					
					new ThreadDAO().delete(obj, current, deleted, pp.bool("preferHard"));
				}
			}
		}
		
	}
	
}
