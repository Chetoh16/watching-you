package classes;
import java.util.Scanner;  
public class App {

	public static void main(String[] args) {
		Watchlist wlist = new Watchlist();
		
		// Example list
		Media newMedia = new Media("Inception" ,"Thriller", "Dream", 2.2, 1);
		wlist.addMedia(newMedia);
		Media newMedia2 = new Media("Last of us" ,"Thriller", "Dream", 2.2, 1);
		wlist.addMedia(newMedia2);
		Media newMedia3 = new Media("I am legend" ,"Thriller", "Dream", 2.2, 1);
		wlist.addMedia(newMedia3);		
		Media newMedia4 = new Media("12 Angry Men" ,"Thriller", "Dream", 2.2, 1);
		wlist.addMedia(newMedia4);	
		
		
	    Scanner myObj = new Scanner(System.in);  // Scanner object
	    System.out.println("Enter\nX to Exit, P to Print watchlist,\nA to Add, R to Remove,\nW to mark as Watched, RW to Remove Watched media\n");
	    
	    String input = "";  // Store user input

	    while (true) {
	        input = myObj.nextLine().trim();  // Read and trim white space

	        if (input.equalsIgnoreCase("X")) {
	            System.out.println("Exiting...");
	            break;
	        }

	        switch (input.toUpperCase()) {
	        	case "P": 
	        		wlist.printList();
	        		break;
	        	case "A":
	        		Media newM = new Media(null, null, null, 0, 0);
	        		System.out.println("Enter the name of the media\n");
	        		input = myObj.nextLine().trim();
	        		newM.setName(input);      
	        		System.out.println("Enter the genre of the media\n");
	        		input = myObj.nextLine().trim();
	        		newM.setGenre(input);     
	        		System.out.println("Enter a description for the media\n");
	        		input = myObj.nextLine();
	        		newM.setDesc(input);  
	        		System.out.println("Enter the duration of the media in hours (float)\n");
	        		input = myObj.nextLine().trim();
	        		newM.setDuration(Double. parseDouble(input)); 
	        		System.out.println("From 1(High)-5(Low) enter how much you want to watch it.\n");
	        		input = myObj.nextLine().trim();
	        		newM.setDesire(Integer.parseInt(input));
	        		wlist.addMedia(newM);
	        		break;
	        	case "R":
	        		System.out.println("Enter the index of the media you want to remove.\n");
	        		input = myObj.nextLine().trim();
	        		int index = Integer.parseInt(input);
	        		if(index > wlist.getSize() - 1 || index < 0) {
	        			System.out.println("Index out of bound, enter a valid number.");
	        			break;
	        		}
	        		System.out.println(wlist.getMedia(index).getName() + " removed.\n");
	        		wlist.removeMedia(index);	        		
	        		break;
	        	case "W":
	        		System.out.println("Enter the index of the media you want to mark as watched.\n");
	        		input = myObj.nextLine().trim();
	        		int index2 = Integer.parseInt(input);
	        		if(index2 > wlist.getSize() - 1 || index2 < 0) {
	        			System.out.println("Index out of bound, enter a valid number.");
	        			break;
	        		}
	        		wlist.getMedia(index2).setWatched(true);
	        		System.out.println(wlist.getMedia(index2).getName() + " is set as watched.\n");
	        		break;
	        	case "RW":
	        		System.out.println("Removing watched media.");
	        		wlist.removeWatched();	        		
	        		break;
	        }
	    }
	    
		
	
	
		
		
	    myObj.close();
	}
}


