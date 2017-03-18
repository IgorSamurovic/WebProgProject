package views;

import model.User;

public class Views
{
	@SuppressWarnings("rawtypes")
	private static final Class[] classes = {Public.class, Public.class, Public.class, Admin.class};
	
	@SuppressWarnings("rawtypes")
	public static Class getClass(int id)
	{
		return classes[id];
	}
	
	@SuppressWarnings("rawtypes")
	public static Class forUser(User u)
	{
		return classes[u.getRole()];
	}
	
	@SuppressWarnings("rawtypes")
	public static Class getPersonal(User u)
	{
		if (u.getRole() == User.Role.GUEST)
			return Public.class;
		else if (u.getRole() < User.Role.ADMIN)
			return Personal.class;
		else
			return Admin.class;
	}
	
    public static class Public {}
    public static class Personal extends Public {}
    public static class Admin extends Personal {}
}
