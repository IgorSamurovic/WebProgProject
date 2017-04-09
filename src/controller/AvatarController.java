package controller;

import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Iterator;
import java.util.List;

import javax.imageio.ImageIO;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import controller.util.ParamProcessor;
import model.User;
import util.Cookies;

public class AvatarController extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private String getAvatarPath(String id)
	{
		return "X:\\dev\\web\\avatars\\" + id + ".jpg";
	}
	
	private static final int MAX_WIDTH = 120;
	private static final int MAX_HEIGHT = 120;
	
	public static BufferedImage resize(BufferedImage img, int newW, int newH) { 
	    Image tmp = img.getScaledInstance(newW, newH, Image.SCALE_SMOOTH);
	    BufferedImage dimg = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_RGB);

	    Graphics2D g2d = dimg.createGraphics();
	    g2d.drawImage(tmp, 0, 0, null);
	    g2d.dispose();

	    return dimg;
	} 
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		ParamProcessor pp = new ParamProcessor(req);
		String id = pp.string("id");
		String has = pp.string("has");
		
		if (id != null)
		{
			String filename = getAvatarPath(id);

		    File file = new File(filename);
		    if (!file.exists())
		    {
		    	filename = getAvatarPath("default");
		    	file = new File(filename);
		    }
		    
		    resp.setContentLength((int)file.length());

		    FileInputStream in = new FileInputStream(file);
		    OutputStream out = resp.getOutputStream();

		    byte[] buf = new byte[1024];
		    int count = 0;
		    while ((count = in.read(buf)) >= 0) {
		    	out.write(buf, 0, count);
		    }
		    
		    out.close();
		    in.close();
		}
		else if (has != null)
		{
			String filename = getAvatarPath(has);
			File file = new File(filename);
			resp.getWriter().print(file.exists());
		}
	    
	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		boolean isMultipart = ServletFileUpload.isMultipartContent(request);
		if (isMultipart)
		{
			DiskFileItemFactory factory = new DiskFileItemFactory();
			ServletContext servletContext = this.getServletConfig().getServletContext();
			File repository = (File) servletContext.getAttribute("javax.servlet.context.tempdir");
			factory.setRepository(repository);
			ServletFileUpload upload = new ServletFileUpload(factory);

			String id = null;
			
			try {
				List<FileItem> items = upload.parseRequest(request);
				Iterator<FileItem> iter = items.iterator();
				while (iter.hasNext())
				{
					FileItem item = iter.next();
					if (!item.isFormField())
					{
						String mimeType = item.getContentType();
						if (mimeType.startsWith("image/"))
						{
							String path = getAvatarPath(id);
							
							File existingFile = new File(path);
							File oldFile = new File(path+".old");
							if (oldFile.exists()) oldFile.delete();
							existingFile.renameTo(oldFile);
							
							File uploadedFile = new File(path);
							uploadedFile.getParentFile().mkdirs(); 
							uploadedFile.createNewFile();
							
							BufferedImage bi = ImageIO.read(item.getInputStream());
							if (bi == null)
							{
								response.getWriter().print("not image");
								return;
							}
							else
							{
								bi = resize(bi, MAX_WIDTH, MAX_HEIGHT);
								ImageIO.write(bi, "jpg", uploadedFile);
								response.getWriter().print("ok");
							}
						}
						else
						{
							response.getWriter().print("not image");
						}
					}
					else
					{
						id = item.getString();
					}
				}
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
	
	public void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException
	{
		User current = Cookies.getUser(req);
		ParamProcessor pp = new ParamProcessor(req);
		String id = pp.string("id");
		if (current.getId() == Integer.valueOf(id) || current.getRole() >= User.Role.ADMIN)
		{
			File f = new File(getAvatarPath(id));
			File old = new File(getAvatarPath(id) + ".old");

			if (old.exists()) old.delete();
			f.renameTo(old);

		}
		else
		{
			resp.sendError(403);
		}
		
	}

}
