import java.util.*;
import java.io.*;

public class Main {
  public static void main(String[] args) throws IOException{
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    BufferedWriter wr = new BufferedWriter(new OutputStreamWriter(System.out));

    StringTokenizer st = new StringTokenizer(br.readLine());
    int N = Integer.parseInt(st.nextToken());
    int K = Integer.parseInt(st.nextToken());

    int counter = 0;
    for(int i =1; i <= N; i++){
      if(N%i == 0){
        counter++;
        if(counter == K){
          wr.write(String.valueOf(i));
          break;
        }
      }
    }

    if(counter < K){
      wr.write(String.valueOf(0));
    }
    
    wr.flush();
  }
}