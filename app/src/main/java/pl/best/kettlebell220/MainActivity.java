package pl.best.kettlebell220;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.WindowManager;
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class MainActivity extends Activity {
  private WebView web;

  private String readAsset(String name){
    StringBuilder out=new StringBuilder();
    try(BufferedReader br=new BufferedReader(new InputStreamReader(getAssets().open(name)))){
      String line;
      while((line=br.readLine())!=null) out.append(line).append('\n');
    }catch(Exception ignored){}
    return out.toString();
  }

  @Override public void onCreate(Bundle b){
    super.onCreate(b);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    web=new WebView(this);
    setContentView(web);
    web.getSettings().setJavaScriptEnabled(true);
    web.getSettings().setDomStorageEnabled(true);
    web.setWebChromeClient(new WebChromeClient());
    web.setWebViewClient(new WebViewClient(){
      @Override public void onPageFinished(WebView view,String url){
        super.onPageFinished(view,url);
        String js=readAsset("persistence.js");
        if(!js.isEmpty()) view.evaluateJavascript(js,null);
      }
    });
    web.loadUrl("file:///android_asset/index.html");
  }

  @Override public void onBackPressed(){ if(web.canGoBack()) web.goBack(); else super.onBackPressed(); }
}
