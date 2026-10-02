import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Copy, 
  Check, 
  Smartphone, 
  Database, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'kotlin' | 'firestore' | 'xml' | 'export_logic'>('kotlin');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 3000);
  };

  const KOTLIN_CODE = `// ==========================================
// KOTLIN / ANDROID FIREBASE ARCHITECTURE
// ==========================================

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.Query
import android.widget.Toast

class GateKeeperManager {
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()

    // 1. Admin Registration Logic
    fun registerUser(email: String, pass: String, name: String, dept: String) {
        auth.createUserWithEmailAndPassword(email, pass).addOnSuccessListener { result ->
            val userId = result.user?.uid
            val userMap = hashMapOf(
                "name" to name,
                "username" to email,
                "department" to dept
            )
            db.collection("users").document(userId!!).set(userMap)
                .addOnSuccessListener {
                    // User successfully registered in Firestore
                }
        }
    }

    // 2. Department-Based Login Logic
    fun login(email: String, pass: String, onRoute: (String) -> Unit) {
        auth.signInWithEmailAndPassword(email, pass).addOnSuccessListener { result ->
            val uid = result.user?.uid
            db.collection("users").document(uid!!).get().addOnSuccessListener { doc ->
                val role = doc.getString("department") ?: "Employee"
                if (role == "Management") {
                    onRoute("ManagementActivity")
                } else if (role == "Admin") {
                    onRoute("AdminActivity")
                } else {
                    onRoute("EmployeeActivity")
                }
            }
        }
    }

    // 3. Management Validation & Save Data
    fun isValidVehicle(number: String): Boolean {
        // Pattern: 2 letters, 2 digits, 1 letter, space, 4 digits (e.g. WB39F 9009)
        val pattern = Regex("^[A-Z]{2}[0-9]{2}[A-Z]{1}\\\\s[0-9]{4}$")
        return pattern.matches(number)
    }

    fun saveData(vNumber: String, date: String, time: String) {
        if (!isValidVehicle(vNumber)) {
            // Toast: Invalid Format (e.g. WB39F 9009)
            return
        }
        
        val record = hashMapOf(
            "vehicleNumber" to vNumber,
            "date" to date,
            "time" to time,
            "timestamp" to FieldValue.serverTimestamp()
        )
        db.collection("records").add(record)
    }

    // 4. Employee Date-Based Query
    fun fetchDataByDate(selectedDate: String, onLoaded: (List<String>) -> Unit) {
        db.collection("records")
            .whereEqualTo("date", selectedDate)
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .get()
            .addOnSuccessListener { documents ->
                val list = mutableListOf<String>()
                for (doc in documents) {
                    val vNo = doc.getString("vehicleNumber")
                    val time = doc.getString("time")
                    list.add("$vNo - $time")
                }
                onLoaded(list)
            }
    }
}`;

  const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function isManagementOrAdmin() {
      return isSignedIn() && (getUserData().department in ['Management', 'Admin']);
    }

    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      // Only Admin can create or write user roles
      allow write: if isSignedIn() && getUserData().department == 'Admin';
    }

    // Records collection
    match /records/{recordId} {
      // Employees, Management, and Admins can query records
      allow read: if isSignedIn();
      // Only Management and Admin can insert new vehicle records
      allow create, update, delete: if isManagementOrAdmin();
    }
  }
}`;

  const XML_LAYOUT = `<!-- activity_management.xml -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <!-- Vehicle Number with textAllCaps -->
    <com.google.android.material.textfield.TextInputLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Vehicle Number (e.g. WB39F 9009)">

        <com.google.android.material.textfield.TextInputEditText
            android:id="@+id/etVehicleNumber"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:textAllCaps="true"
            android:fontFamily="monospace"
            android:maxLength="10" />
    </com.google.android.material.textfield.TextInputLayout>

    <!-- Date & Time Pickers -->
    <TextView
        android:id="@+id/tvDate"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="12dp"
        android:padding="12dp"
        android:background="?attr/selectableItemBackground"
        android:text="Date: 2026-10-01" />

    <TextView
        android:id="@+id/tvTime"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:padding="12dp"
        android:background="?attr/selectableItemBackground"
        android:text="Time: 09:30" />

    <!-- Submit Button -->
    <Button
        android:id="@+id/btnSubmit"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="20dp"
        android:text="Save Record" />

    <!-- CSV Export Button with Date Range -->
    <Button
        android:id="@+id/btnExportCSV"
        style="@style/Widget.MaterialComponents.Button.OutlinedButton"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:text="Export CSV (Date Range)" />
</LinearLayout>`;

  const EXPORT_LOGIC = `// ==========================================
// CSV EXPORT LOGIC FOR ANDROID / JAVA
// ==========================================

import android.content.Context
import android.content.Intent
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileWriter

fun exportRecordsToCSV(
    context: Context,
    recordsList: List<VehicleRecord>,
    startDate: String,
    endDate: String
) {
    val fileName = "vehicle_records_\${startDate}_to_\${endDate}.csv"
    val exportDir = File(context.getExternalFilesDir(null), "exports")
    if (!exportDir.exists()) exportDir.mkdirs()

    val file = File(exportDir, fileName)
    val writer = FileWriter(file)

    // Write CSV Header
    writer.append("date,time,vehicleNumber,timestamp\\n")

    // Filter and write records within selected date range
    recordsList
        .filter { it.date >= startDate && it.date <= endDate }
        .forEach { r ->
            writer.append("\${r.date},\${r.time},\${r.vehicleNumber},\${r.timestamp}\\n")
        }

    writer.flush()
    writer.close()

    // Share via Android Intent
    val uri = FileProvider.getUriForFile(
        context,
        "\${context.packageName}.fileprovider",
        file
    )

    val shareIntent = Intent(Intent.ACTION_SEND).apply {
        type = "text/csv"
        putExtra(Intent.EXTRA_STREAM, uri)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    context.startActivity(Intent.createChooser(shareIntent, "Share Vehicle Records CSV"))
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Code2 className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Android & Firebase Architecture Blueprint</h3>
              <p className="text-xs text-slate-300">Step-by-step code and database structure for the Android app</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('kotlin')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'kotlin'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Kotlin Core Logic</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export_logic')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'export_logic'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>CSV Export & Share</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('firestore')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'firestore'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Firestore Rules & Schema</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('xml')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'xml'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Android XML Layout</span>
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs bg-slate-950 text-slate-200">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              {activeTab === 'kotlin' && 'GateKeeperManager.kt'}
              {activeTab === 'export_logic' && 'CSVExportHelper.kt'}
              {activeTab === 'firestore' && 'firestore.rules'}
              {activeTab === 'xml' && 'activity_management.xml'}
            </span>

            <button
              type="button"
              onClick={() => {
                const text =
                  activeTab === 'kotlin'
                    ? KOTLIN_CODE
                    : activeTab === 'export_logic'
                    ? EXPORT_LOGIC
                    : activeTab === 'firestore'
                    ? FIRESTORE_RULES
                    : XML_LAYOUT;
                copyToClipboard(text, activeTab);
              }}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied === activeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 bg-slate-900 rounded-xl overflow-x-auto leading-relaxed border border-slate-800 text-slate-300">
            {activeTab === 'kotlin' && KOTLIN_CODE}
            {activeTab === 'export_logic' && EXPORT_LOGIC}
            {activeTab === 'firestore' && FIRESTORE_RULES}
            {activeTab === 'xml' && XML_LAYOUT}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-sans">
          <span>Ready to import into Android Studio project with `google-services.json`.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
