package controller;

import java.io.IOException;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import controller.util.ParamProcessor;
import controller.util.Responder;
import model.Post;
import model.User;
import model.dao.PostDAO;
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
		
		// Done
		if (reqType.equals("add")) {
			obj = new Post();
			obj.setText(text);
			obj.setThread(thread);
			obj.setOwner(owner);
			
			error = obj.checkForErrors();

			if (error != null) {
				Responder.out(response, error);
				return;
			}
			
			new PostDAO().insert(obj);
			pp.setForLast();
			obj = ((ArrayList<Post>) new PostDAO().filter(pp, current).get(1)).get(0);
			Responder.out(response, Integer.toString(obj.getId()));
			return;
		} 

		if (reqType.equals("edit")) {
			obj.setText(text);
			
			error = obj.checkForErrors();
			
			if (error != null) {
				Responder.out(response, error);
				return;
			}

			new PostDAO().update(obj);
			return;
		}
		
		if (reqType.equals("del")) {
			if (id != null) {
				if (deleted != null) {
					obj = new PostDAO().findById(id);
					
					obj.setDeleted(deleted);
					error = obj.checkForErrors();
					
					if (error != null) {
						Responder.out(response, error);
						return;
					}
					
					new PostDAO().delete(obj, current, deleted, pp.bool("preferHard"));
					return;
				}
			}
		}
		
	}
	
}
