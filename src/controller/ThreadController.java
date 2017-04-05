package controller;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.annotation.JsonView;

import controller.util.ParamProcessor;
import controller.util.Responder;
import model.Forum;
import model.Thread;
import model.User;
import model.dao.ForumDAO;
import model.dao.ThreadDAO;
import util.Cookies;
import views.Views;

public class ThreadController extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		User current = Cookies.getUser(request);
		ParamProcessor pp = new ParamProcessor(request);
		
		Integer id = pp.integer("id");
		if (id != null) {
			Thread result = new ThreadDAO().findById(id, current);
			if (result != null)
				if (current.getId() == id) {
					Responder.out(response, result, Views.getPersonal(current));
				} else {
					Responder.out(response, result, Views.forUser(current));
				} else {
					Responder.out(response, "notFound");
				}
		} else {
			ArrayList<Object> results = new ThreadDAO().filter(pp, current);
			Responder.out(response, results, Views.forUser(current));
		}
    }
    
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		// First initialize variables
		User current = Cookies.getUser(request);
		
		ParamProcessor pp = new ParamProcessor(request);
		Thread obj = null;
		String valid = "";
		
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
			obj.setSticky(sticky);
			
			valid = obj.valid();
			pp.printDebug();

			if (!valid.equals("")) {
				Responder.out(response, valid);
				return;
			}
			
			new ThreadDAO().insert(obj);
		} 

		if (reqType.equals("edit")) {
			obj = new ThreadDAO().findById(id);
			if (title != null) obj.setTitle(title);
			if (descript != null) obj.setDescript(descript);
			if (text != null) obj.setText(text);
			if (forum != null) obj.setForum(forum);
			if (owner != null) obj.setOwner(owner);
			
			valid = obj.valid();
			
			if (!valid.equals("")) {
				Responder.out(response, valid);
				return;
			}
			//currenSystem.err.println(obj);
			new ThreadDAO().update(obj);
		}
		
		if (reqType.equals("stick")) {
			if (id != null && sticky != null) {
				obj = new ThreadDAO().findById(id, current);
				obj.setSticky(sticky);
				
				valid = obj.valid();
				
				if (!valid.equals("")) {
					Responder.out(response, valid);
					return;
				}
				
				new ThreadDAO().stick(obj, sticky);
			}
		}
		
		if (reqType.equals("lock")) {
			if (id != null && locked != null) {
				obj = new ThreadDAO().findById(id, current);
				obj.setLocked(locked);
				
				valid = obj.valid();
				
				if (!valid.equals("")) {
					Responder.out(response, valid);
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
					valid = obj.valid();
					
					if (!valid.equals("")) {
						Responder.out(response, valid);
						return;
					}
					
					new ThreadDAO().delete(obj, current, deleted, pp.bool("preferHard"));
				}
			}
		}
		
	}
	
}
