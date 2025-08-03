import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/** Types */
type Teacher = {
  id: string;
  name: string;
  photoUrl: string;
  rating: number;
  experienceYears: number;
  numClasses: number;
  costPerClass: number;
  studyStructure: string[];
};

type Chapter = {
  id: string;
  name: string;
  teachers: Teacher[];
};

/** Seed data */
const INITIAL: Chapter[] = [
  {
    id: "kinematics",
    name: "Kinematics",
    teachers: [
      {
        id: "teacher_1",
        name: "Dr. A. Sharma",
        photoUrl: "/placeholder.jpg",
        rating: 4.9,
        experienceYears: 8,
        numClasses: 5,
        costPerClass: 1200,
        studyStructure: [
          "Class 1: Introduction to displacement & velocity",
          "Class 2: Acceleration & graphs",
          "Class 3: Projectile motion basics",
          "Class 4: Relative motion problems",
          "Class 5: Mixed problem solving"
        ]
      }
    ]
  },
  { id: "newton-law", name: "Newton Law of Motion", teachers: [] },
  { id: "work-energy-power", name: "Work Energy Power", teachers: [] },
  { id: "rotational-motion", name: "Rotational Motion", teachers: [] },
  { id: "gravitation", name: "Gravitation", teachers: [] }
];

/** Helpers */
const storageKey = "physics_marketplace_data";
const loadChapters = (): Chapter[] => {
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  return INITIAL;
};
const saveChapters = (chapters: Chapter[]) =>
  localStorage.setItem(storageKey, JSON.stringify(chapters));

/** Components */

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1 text-sm">
      {Array.from({ length: full }).map((_, i) => (
        <div key={i} className="text-yellow-500">★</div>
      ))}
      {half && <div className="text-yellow-500">☆</div>}
      {Array.from({ length: 5 - full - (half ? 1 : 0) }).map((_, i) => (
        <div key={i} className="text-gray-300">★</div>
      ))}
      <div className="ml-1 text-gray-600">{rating.toFixed(1)}</div>
    </div>
  );
};

const TeacherCard: React.FC<{
  teacher: Teacher;
  onView: (t: Teacher) => void;
}> = ({ teacher, onView }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex gap-4 hover:shadow-xl transition relative">
      <div className="flex-shrink-0">
        <img
          src={teacher.photoUrl}
          alt={teacher.name}
          className="w-16 h-16 rounded-full object-cover"
        />
      </div>
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between">
          <div className="font-semibold text-lg">{teacher.name}</div>
          <div className="text-sm text-gray-500">{teacher.numClasses} classes</div>
        </div>
        <RatingStars rating={teacher.rating} />
        <div className="mt-2 flex items-center gap-4">
          <div className="text-sm">₹{teacher.costPerClass.toLocaleString()} / class</div>
          <button
            onClick={() => onView(teacher)}
            className="ml-auto px-3 py-1 bg-primary text-white rounded-md text-sm"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

const BuyNowModal: React.FC<{
  teacher: Teacher;
  chapterName: string;
  onClose: () => void;
}> = ({ teacher, chapterName, onClose }) => {
  const total = teacher.costPerClass * teacher.numClasses;
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl w-full max-w-md p-6 relative shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="close"
          className="absolute top-3 right-3 text-gray-500"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-2">Confirm Purchase</h2>
        <div className="text-sm text-gray-600 mb-4">
          {teacher.name} — {chapterName}
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <div>Classes:</div>
            <div>{teacher.numClasses}</div>
          </div>
          <div className="flex justify-between">
            <div>Cost per class:</div>
            <div>₹{teacher.costPerClass.toLocaleString()}</div>
          </div>
          <div className="flex justify-between font-semibold">
            <div>Total:</div>
            <div>₹{total.toLocaleString()}</div>
          </div>
        </div>
        {!confirmed ? (
          <>
            <div className="mb-4">
              <div className="text-sm font-medium mb-1">Your Name</div>
              <input
                placeholder="Enter your name"
                className="w-full border rounded-md p-2"
              />
            </div>
            <div className="mb-4">
              <div className="text-sm font-medium mb-1">Email</div>
              <input
                placeholder="you@example.com"
                className="w-full border rounded-md p-2"
              />
            </div>
            <button
              onClick={() => setConfirmed(true)}
              className="w-full py-3 rounded-xl bg-accent text-white font-semibold shadow-lg"
            >
              Confirm & Pay ₹{total.toLocaleString()}
            </button>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-green-600 font-bold text-lg">Success!</div>
            <div>You've purchased all classes. Access will appear shortly.</div>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2 bg-primary text-white rounded-md"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const AdminDrawer: React.FC<{
  chapters: Chapter[];
  setChapters: (c: Chapter[]) => void;
  onClose: () => void;
}> = ({ chapters, setChapters, onClose }) => {
  const [selectedChapterId, setSelectedChapterId] = useState(chapters[0].id);
  const [form, setForm] = useState({
    name: "",
    rating: 5,
    experienceYears: 1,
    numClasses: 1,
    costPerClass: 500,
    studyStructure: ["Example Class 1"]
  });

  const chapter = chapters.find((c) => c.id === selectedChapterId)!;

  const addTeacher = () => {
    if (!form.name) return;
    const newTeacher: Teacher = {
      id: "t_" + Date.now(),
      name: form.name,
      photoUrl: "/placeholder.jpg",
      rating: form.rating,
      experienceYears: form.experienceYears,
      numClasses: form.studyStructure.length,
      costPerClass: form.costPerClass,
      studyStructure: form.studyStructure
    };
    const updated = chapters.map((c) =>
      c.id === selectedChapterId
        ? { ...c, teachers: [...c.teachers, newTeacher] }
        : c
    );
    setChapters(updated);
    saveChapters(updated);
    // reset minimal
    setForm((f) => ({ ...f, name: "", studyStructure: [f.studyStructure[0]] }));
  };

  return (
    <div className="fixed inset-0 flex z-50">
      <div
        className="bg-black/30 flex-grow"
        onClick={onClose}
        aria-label="backdrop"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        className="w-full max-w-md bg-white shadow-xl p-6 overflow-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Admin / Add Teacher</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Chapter</label>
          <select
            className="w-full border rounded-md p-2"
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
          >
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Teacher Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-md p-2"
              placeholder="e.g., Ms. R. Gupta"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Rating</label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.rating}
                onChange={(e) =>
                  setForm({ ...form, rating: Number(e.target.value) })
                }
                className="w-full border rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Experience (yrs)</label>
              <input
                type="number"
                min={0}
                value={form.experienceYears}
                onChange={(e) =>
                  setForm({ ...form, experienceYears: Number(e.target.value) })
                }
                className="w-full border rounded-md p-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Cost per class</label>
              <input
                type="number"
                min={0}
                value={form.costPerClass}
                onChange={(e) =>
                  setForm({ ...form, costPerClass: Number(e.target.value) })
                }
                className="w-full border rounded-md p-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Study Structure (one per line)
            </label>
            <textarea
              value={form.studyStructure.join("\n")}
              onChange={(e) =>
                setForm({
                  ...form,
                  studyStructure: e.target.value
                    .split("\n")
                    .filter((s) => s.trim())
                })
              }
              rows={4}
              className="w-full border rounded-md p-2 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addTeacher}
              className="flex-grow bg-primary text-white py-2 rounded-xl font-semibold"
            >
              Add Teacher
            </button>
          </div>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          Added teachers appear immediately in the student view. Data is stored
          in localStorage for demo.
        </div>
      </motion.div>
    </div>
  );
};

/** Main App */
const App: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>(loadChapters());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<{
    teacher: Teacher;
    chapter: Chapter;
  } | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  useEffect(() => {
    saveChapters(chapters);
  }, [chapters]);

  const openProfile = (teacher: Teacher, chapter: Chapter) => {
    setSelectedTeacher({ teacher, chapter });
  };

  const totalCost = (t: Teacher) => t.costPerClass * t.numClasses;

  return (
    <div className="min-h-screen font-sans text-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <div className="text-2xl font-bold">Physics</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAdmin(true)}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Admin"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Chapter Accordions */}
        {chapters.map((chapter) => (
          <div key={chapter.id} className="space-y-2">
            <motion.div
              layout
              className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center cursor-pointer"
              onClick={() =>
                setExpanded((e) => (e === chapter.id ? null : chapter.id))
              }
            >
              <div className="font-semibold text-lg">{chapter.name}</div>
              <div className="text-sm text-gray-600">
                {chapter.teachers.length} teacher
                {chapter.teachers.length !== 1 && "s"}
              </div>
            </motion.div>
            <AnimatePresence>
              {expanded === chapter.id && (
                <motion.div
                  layout
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3"
                >
                  {chapter.teachers.length === 0 && (
                    <div className="bg-gray-50 rounded-md p-4 text-gray-600 flex justify-between items-center">
                      <div>No teachers added yet. Check back soon!</div>
                      <div className="text-sm">
                        <span className="font-medium">Admin:</span> add from menu
                      </div>
                    </div>
                  )}
                  {chapter.teachers.map((t) => (
                    <TeacherCard
                      key={t.id}
                      teacher={t}
                      onView={(tch) => openProfile(tch, chapter)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Teacher Profile Slide-up */}
        <AnimatePresence>
          {selectedTeacher && (
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={() => setSelectedTeacher(null)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="fixed inset-0 bg-white z-50 overflow-auto flex flex-col"
              >
                <div className="flex justify-between items-center px-6 py-4 border-b">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedTeacher.teacher.photoUrl}
                      alt={selectedTeacher.teacher.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-2xl font-bold">
                        {selectedTeacher.teacher.name}
                      </div>
                      <div className="flex gap-4 mt-1 items-center">
                        <RatingStars rating={selectedTeacher.teacher.rating} />
                        <div className="text-sm text-gray-600">
                          {selectedTeacher.teacher.experienceYears} yrs experience
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Expert in {selectedTeacher.chapter.name}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTeacher(null)}>✕</button>
                </div>

                <div className="flex flex-col lg:flex-row flex-grow">
                  {/* Left content */}
                  <div className="flex-grow px-6 py-6 space-y-6">
                    <div>
                      <div className="text-xl font-semibold mb-2">
                        Chapter Study Structure
                      </div>
                      <ol className="list-decimal list-inside space-y-2">
                        {selectedTeacher.teacher.studyStructure.map(
                          (s, i) => (
                            <li key={i} className="bg-gray-50 p-3 rounded-md shadow-sm">
                              {s}
                            </li>
                          )
                        )}
                      </ol>
                    </div>
                  </div>

                  {/* Summary panel */}
                  <div className="bg-white border-l lg:border-l p-6 w-full lg:w-80 relative">
                    <div className="sticky top-6 space-y-4">
                      <div className="text-lg font-semibold">Summary</div>
                      <div className="flex justify-between">
                        <div>Cost per class</div>
                        <div>₹{selectedTeacher.teacher.costPerClass.toLocaleString()}</div>
                      </div>
                      <div className="flex justify-between">
                        <div>Number of classes</div>
                        <div>{selectedTeacher.teacher.numClasses}</div>
                      </div>
                      <div className="flex justify-between font-bold">
                        <div>Total</div>
                        <div>
                          ₹
                          {(
                            selectedTeacher.teacher.costPerClass *
                            selectedTeacher.teacher.numClasses
                          ).toLocaleString()}
                        </div>
                      </div>

                      <div className="mt-4">
                        <button
                          onClick={() => setShowBuyModal(true)}
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold text-lg relative overflow-hidden"
                          style={{
                            boxShadow: "0 0 25px rgba(3,169,244,0.6)",
                            animation: "pulse-glow 3s infinite"
                          }}
                        >
                          Buy All Classes ₹
                          {(
                            selectedTeacher.teacher.costPerClass *
                            selectedTeacher.teacher.numClasses
                          ).toLocaleString()}
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        1 class ≈ 1 hour (estimate)
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Buy Modal */}
        <AnimatePresence>
          {showBuyModal && selectedTeacher && (
            <BuyNowModal
              teacher={selectedTeacher.teacher}
              chapterName={selectedTeacher.chapter.name}
              onClose={() => setShowBuyModal(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Admin Drawer */}
      <AnimatePresence>
        {showAdmin && (
          <AdminDrawer
            chapters={chapters}
            setChapters={setChapters}
            onClose={() => setShowAdmin(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sticky buy bar if teacher open */}
      {selectedTeacher && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex justify-between items-center lg:hidden">
          <div>
            <div className="text-sm">
              Total: ₹
              {(
                selectedTeacher.teacher.costPerClass *
                selectedTeacher.teacher.numClasses
              ).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {selectedTeacher.teacher.numClasses} classes
            </div>
          </div>
          <button
            onClick={() => setShowBuyModal(true)}
            className="px-5 py-3 rounded-xl bg-accent text-white font-semibold"
            style={{ boxShadow: "0 0 20px rgba(3,169,244,0.6)" }}
          >
            Buy Now
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
