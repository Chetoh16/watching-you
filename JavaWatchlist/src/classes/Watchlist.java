package classes;

import java.util.ArrayList;
import java.util.List;

public class Watchlist {
	ArrayList<Media> wlist = new ArrayList<Media>();
	
	public int getSize() {
		return wlist.size();
	}

	public void addMedia(Media media){
		int assignedID = wlist.size();
		media.setID(assignedID);		
		wlist.add(media);
	}
	
	public void removeMedia(int index){
		wlist.remove(index);
		this.reorganiseID(index);
		
	}
	
	public void printList(){
		for(int i = 0; i < wlist.size(); i++) {   
		    System.out.println(wlist.get(i));
		}  
	}
	

	public void reorganiseID(int index){
		// Throw error if index is out of range
		for(int i = index; i < wlist.size(); i++) {
			Media media = wlist.get(i);
			media.setID(i);
		}
	}

	public Media getMedia(int index) {
		// Throw error if index is out of range
		return wlist.get(index);
	}
	
	/*
	public void isIndexIsValid(int index) {
		if(index > wlist.size() || index < 0) {
			throw new ArrayIndexOutOfBoundsException("Index out of bound, enter a valid number.");
		}
	}
	*/
	
	public void removeWatched(){
		for(int i = 0; i < wlist.size(); i++) {
			Media media = wlist.get(i);
			if(media.watched == true){
				removeMedia(media.getID());
			}
		}
	}

	// Potentially unnecessary
	public void sortByID(){
		
	}
	
	public void sortByDesire(){
		
	}


	

	
	

}
