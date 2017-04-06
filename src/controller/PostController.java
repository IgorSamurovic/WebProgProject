package controller;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import controller.util.ParamProcessor;
import controller.util.Responder;
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
		ParamProcessor pp = new ParamProcessor(request);
		User current = Cookies.getUser(request);
		
		Integer id = pp.integer("id");
		String text = pp.string("text");
		Integer thread = pp.integer("thread");
		Integer owner = pp.integer("owner");
		Boolean deleted = pp.bool("deleted");
		
		String reqType = pp.string("reqType");
		
	}
	
}
