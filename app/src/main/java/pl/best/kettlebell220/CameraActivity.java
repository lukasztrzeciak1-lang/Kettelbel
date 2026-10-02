package pl.best.kettlebell220;

import android.Manifest;
import android.content.ContentValues;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.media.Image;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageAnalysis;
import androidx.camera.core.ImageProxy;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.video.MediaStoreOutputOptions;
import androidx.camera.video.Recorder;
import androidx.camera.video.Recording;
import androidx.camera.video.VideoCapture;
import androidx.camera.video.VideoRecordEvent;
import androidx.camera.view.PreviewView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.common.util.concurrent.ListenableFuture;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.pose.Pose;
import com.google.mlkit.vision.pose.PoseDetection;
import com.google.mlkit.vision.pose.PoseDetector;
import com.google.mlkit.vision.pose.PoseLandmark;
import com.google.mlkit.vision.pose.defaults.PoseDetectorOptions;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class CameraActivity extends AppCompatActivity {
    private static final int REQ_CAMERA = 101;

    private PreviewView previewView;
    private TextView totalView, sidesView, paceView, statusView;
    private Button recordButton, switchButton;

    private ProcessCameraProvider cameraProvider;
    private VideoCapture<Recorder> videoCapture;
    private Recording recording;
    private ExecutorService analysisExecutor;
    private PoseDetector poseDetector;

    private int lensFacing = CameraSelector.LENS_FACING_BACK;
    private int leftCount = 0, rightCount = 0;
    private boolean leftArmed = false, rightArmed = false;
    private long lastLeftRep = 0, lastRightRep = 0;
    private long recordingStart = 0;
    private boolean processing = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        buildUi();

        analysisExecutor = Executors.newSingleThreadExecutor();
        PoseDetectorOptions options = new PoseDetectorOptions.Builder()
                .setDetectorMode(PoseDetectorOptions.STREAM_MODE)
                .build();
        poseDetector = PoseDetection.getClient(options);

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            startCamera();
        } else {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA}, REQ_CAMERA);
        }
    }

    private void buildUi() {
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);

        previewView = new PreviewView(this);
        previewView.setScaleType(PreviewView.ScaleType.FILL_CENTER);
        root.addView(previewView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        LinearLayout hud = new LinearLayout(this);
        hud.setOrientation(LinearLayout.VERTICAL);
        hud.setPadding(28, 28, 28, 20);
        hud.setBackgroundColor(0x99000000);

        totalView = label("0", 54, Color.WHITE);
        sidesView = label("L: 0   P: 0", 22, 0xFFFFD54F);
        paceView = label("0 / min", 20, Color.WHITE);
        statusView = label("Ustaw całe ciało w kadrze", 16, 0xFFDDDDDD);

        hud.addView(totalView);
        hud.addView(sidesView);
        hud.addView(paceView);
        hud.addView(statusView);

        FrameLayout.LayoutParams hp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        hp.gravity = Gravity.TOP;
        root.addView(hud, hp);

        LinearLayout bottom = new LinearLayout(this);
        bottom.setOrientation(LinearLayout.HORIZONTAL);
        bottom.setGravity(Gravity.CENTER);
        bottom.setPadding(18, 14, 18, 26);
        bottom.setBackgroundColor(0xAA000000);

        recordButton = new Button(this);
        recordButton.setText("● NAGRYWAJ");
        recordButton.setOnClickListener(v -> toggleRecording());

        switchButton = new Button(this);
        switchButton.setText("↺ KAMERA");
        switchButton.setOnClickListener(v -> {
            lensFacing = lensFacing == CameraSelector.LENS_FACING_BACK
                    ? CameraSelector.LENS_FACING_FRONT
                    : CameraSelector.LENS_FACING_BACK;
            bindCameraUseCases();
        });

        LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1);
        bp.setMargins(8, 0, 8, 0);
        bottom.addView(recordButton, bp);
        bottom.addView(switchButton, bp);

        FrameLayout.LayoutParams bottomParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        bottomParams.gravity = Gravity.BOTTOM;
        root.addView(bottom, bottomParams);

        setContentView(root);
    }

    private TextView label(String text, int sp, int color) {
        TextView v = new TextView(this);
        v.setText(text);
        v.setTextSize(sp);
        v.setTextColor(color);
        return v;
    }

    private void startCamera() {
        ListenableFuture<ProcessCameraProvider> future = ProcessCameraProvider.getInstance(this);
        future.addListener(() -> {
            try {
                cameraProvider = future.get();
                bindCameraUseCases();
            } catch (Exception e) {
                Toast.makeText(this, "Nie udało się uruchomić kamery", Toast.LENGTH_LONG).show();
            }
        }, ContextCompat.getMainExecutor(this));
    }

    private void bindCameraUseCases() {
        if (cameraProvider == null) return;

        cameraProvider.unbindAll();

        Preview preview = new Preview.Builder().build();
        preview.setSurfaceProvider(previewView.getSurfaceProvider());

        Recorder recorder = new Recorder.Builder().build();
        videoCapture = VideoCapture.withOutput(recorder);

        ImageAnalysis analysis = new ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .setTargetResolution(new android.util.Size(640, 480))
                .build();
        analysis.setAnalyzer(analysisExecutor, this::analyzeFrame);

        CameraSelector selector = new CameraSelector.Builder()
                .requireLensFacing(lensFacing)
                .build();

        try {
            cameraProvider.bindToLifecycle(this, selector, preview, videoCapture, analysis);
        } catch (Exception e) {
            Toast.makeText(this, "Ten telefon nie obsługuje wybranej kombinacji kamery", Toast.LENGTH_LONG).show();
        }
    }

    private void analyzeFrame(@NonNull ImageProxy imageProxy) {
        if (processing) {
            imageProxy.close();
            return;
        }
        Image mediaImage = imageProxy.getImage();
        if (mediaImage == null) {
            imageProxy.close();
            return;
        }

        processing = true;
        InputImage image = InputImage.fromMediaImage(
                mediaImage, imageProxy.getImageInfo().getRotationDegrees());

        poseDetector.process(image)
                .addOnSuccessListener(this::processPose)
                .addOnFailureListener(e -> { })
                .addOnCompleteListener(task -> {
                    processing = false;
                    imageProxy.close();
                });
    }

    private void processPose(Pose pose) {
        PoseLandmark lWrist = pose.getPoseLandmark(PoseLandmark.LEFT_WRIST);
        PoseLandmark rWrist = pose.getPoseLandmark(PoseLandmark.RIGHT_WRIST);
        PoseLandmark lShoulder = pose.getPoseLandmark(PoseLandmark.LEFT_SHOULDER);
        PoseLandmark rShoulder = pose.getPoseLandmark(PoseLandmark.RIGHT_SHOULDER);
        PoseLandmark lHip = pose.getPoseLandmark(PoseLandmark.LEFT_HIP);
        PoseLandmark rHip = pose.getPoseLandmark(PoseLandmark.RIGHT_HIP);

        if (!good(lWrist) || !good(rWrist) || !good(lShoulder) || !good(rShoulder) || !good(lHip) || !good(rHip)) {
            runOnUiThread(() -> statusView.setText("Odsuń telefon: całe ciało musi być widoczne"));
            return;
        }

        runOnUiThread(() -> statusView.setText(recording == null
                ? "Gotowy — naciśnij NAGRYWAJ"
                : "Liczenie aktywne"));

        if (recording == null) return;

        long now = System.currentTimeMillis();

        float lWristY = lWrist.getPosition().y;
        float rWristY = rWrist.getPosition().y;
        float lShoulderY = lShoulder.getPosition().y;
        float rShoulderY = rShoulder.getPosition().y;
        float lHipY = lHip.getPosition().y;
        float rHipY = rHip.getPosition().y;

        float torsoL = Math.max(45f, lHipY - lShoulderY);
        float torsoR = Math.max(45f, rHipY - rShoulderY);

        if (lWristY > lHipY - torsoL * 0.05f) leftArmed = true;
        if (rWristY > rHipY - torsoR * 0.05f) rightArmed = true;

        boolean leftOverhead = lWristY < lShoulderY - torsoL * 0.28f;
        boolean rightOverhead = rWristY < rShoulderY - torsoR * 0.28f;

        if (leftArmed && leftOverhead && now - lastLeftRep > 650) {
            leftCount++;
            leftArmed = false;
            lastLeftRep = now;
            updateCounter();
        }

        if (rightArmed && rightOverhead && now - lastRightRep > 650) {
            rightCount++;
            rightArmed = false;
            lastRightRep = now;
            updateCounter();
        }
    }

    private boolean good(PoseLandmark p) {
        return p != null && p.getInFrameLikelihood() >= 0.55f;
    }

    private void updateCounter() {
        runOnUiThread(() -> {
            int total = leftCount + rightCount;
            totalView.setText(String.valueOf(total));
            sidesView.setText("L: " + leftCount + "   P: " + rightCount);

            long elapsed = Math.max(1, System.currentTimeMillis() - recordingStart);
            double min = elapsed / 60000.0;
            paceView.setText(String.format(Locale.getDefault(), "%.1f / min", total / min));
        });
    }

    private void toggleRecording() {
        if (videoCapture == null) return;
        if (recording != null) {
            recording.stop();
            return;
        }

        leftCount = 0;
        rightCount = 0;
        leftArmed = false;
        rightArmed = false;
        lastLeftRep = 0;
        lastRightRep = 0;
        recordingStart = System.currentTimeMillis();
        updateCounter();

        String stamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(new Date());
        ContentValues values = new ContentValues();
        values.put(MediaStore.Video.Media.DISPLAY_NAME, "Kettlebell_Snatch_" + stamp);
        values.put(MediaStore.Video.Media.MIME_TYPE, "video/mp4");
        if (Build.VERSION.SDK_INT >= 29) {
            values.put(MediaStore.Video.Media.RELATIVE_PATH, "Movies/Kettlebell220");
        }

        MediaStoreOutputOptions output = new MediaStoreOutputOptions.Builder(
                getContentResolver(), MediaStore.Video.Media.EXTERNAL_CONTENT_URI)
                .setContentValues(values)
                .build();

        recording = videoCapture.getOutput()
                .prepareRecording(this, output)
                .start(ContextCompat.getMainExecutor(this), event -> {
                    if (event instanceof VideoRecordEvent.Start) {
                        recordButton.setText("■ STOP");
                        statusView.setText("Nagrywam i liczę rwanie");
                    } else if (event instanceof VideoRecordEvent.Finalize) {
                        VideoRecordEvent.Finalize fin = (VideoRecordEvent.Finalize) event;
                        recording = null;
                        recordButton.setText("● NAGRYWAJ");
                        if (!fin.hasError()) {
                            statusView.setText("Zapisano film • wynik: " + (leftCount + rightCount));
                            Toast.makeText(this, "Film zapisany w Movies/Kettlebell220", Toast.LENGTH_LONG).show();
                        } else {
                            statusView.setText("Błąd zapisu filmu");
                        }
                    }
                });
    }

    @Override
    public void onBackPressed() {
        if (recording != null) {
            recording.stop();
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (recording != null) recording.stop();
        if (poseDetector != null) poseDetector.close();
        if (analysisExecutor != null) analysisExecutor.shutdown();
        super.onDestroy();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_CAMERA && grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            startCamera();
        } else if (requestCode == REQ_CAMERA) {
            Toast.makeText(this, "Bez dostępu do kamery ten tryb nie działa", Toast.LENGTH_LONG).show();
            finish();
        }
    }
}
