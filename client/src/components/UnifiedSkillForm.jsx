import React, { useState, useEffect } from 'react';

const SKILL_FIELDS = [
  { key: "frontend", label: "Frontend", icon: "💻", desc: "HTML, CSS, JavaScript, React, Vue..." },
  { key: "backend", label: "Backend", icon: "⚙️", desc: "Node.js, Python, Java, Database..." },
  { key: "ai", label: "AI/ML", icon: "🤖", desc: "Machine Learning, Deep Learning, Data Science..." },
  { key: "devops", label: "DevOps", icon: "🔧", desc: "Docker, CI/CD, AWS, Kubernetes..." },
  { key: "mobile", label: "Mobile", icon: "📱", desc: "React Native, Flutter, iOS, Android..." },
  { key: "uxui", label: "UX/UI", icon: "🎨", desc: "Figma, Adobe XD, User Research..." },
  { key: "testing", label: "Testing", icon: "🧪", desc: "Unit Test, Integration Test, QA..." },
  { key: "management", label: "Management", icon: "👔", desc: "Project Management, Leadership, Planning..." },
];

const SKILL_LEVELS = [
  { value: 0, label: "Không biết", color: "bg-gray-100" },
  { value: 1, label: "Mới bắt đầu", color: "bg-red-100" },
  { value: 2, label: "Cơ bản", color: "bg-red-200" },
  { value: 3, label: "Sơ cấp", color: "bg-orange-200" },
  { value: 4, label: "Trung cấp thấp", color: "bg-yellow-200" },
  { value: 5, label: "Trung cấp", color: "bg-yellow-300" },
  { value: 6, label: "Trung cấp cao", color: "bg-lime-300" },
  { value: 7, label: "Khá", color: "bg-green-300" },
  { value: 8, label: "Giỏi", color: "bg-green-400" },
  { value: 9, label: "Xuất sắc", color: "bg-blue-400" },
  { value: 10, label: "Chuyên gia", color: "bg-purple-400" },
];

export default function UnifiedSkillForm({ 
  initialSkills = {}, 
  onSubmit, 
  loading = false, 
  title = "Cập nhật Kỹ Năng",
  submitText = "Lưu Kỹ Năng",
  description = "Đánh giá kỹ năng của bạn từ 0-10 để hệ thống giao việc phù hợp.",
  showCancel = false,
  onCancel
}) {
  const [skills, setSkills] = useState(
    SKILL_FIELDS.reduce((acc, field) => ({ 
      ...acc, 
      [field.key]: initialSkills[field.key] || 1 
    }), {})
  );

  useEffect(() => {
    if (initialSkills && Object.keys(initialSkills).length > 0) {
      setSkills(SKILL_FIELDS.reduce((acc, field) => ({ 
        ...acc, 
        [field.key]: initialSkills[field.key] || 1 
      }), {}));
    }
  }, [initialSkills]);

  const handleChange = (field, value) => {
    setSkills(prev => ({
      ...prev,
      [field]: Math.max(0, Math.min(10, Number(value) || 0))
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(skills);
  };

  const getSkillColor = (value) => {
    const level = SKILL_LEVELS.find(level => level.value === value);
    return level ? level.color : "bg-gray-100";
  };

  const getSkillLabel = (value) => {
    const level = SKILL_LEVELS.find(level => level.value === value);
    return level ? level.label : "Không xác định";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <span className="text-2xl">⭐</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SKILL_FIELDS.map((field) => (
                <div key={field.key} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{field.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{field.label}</h3>
                      <p className="text-sm text-gray-500">{field.desc}</p>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Mức độ thành thạo:</span>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillColor(skills[field.key])}`}>
                        {skills[field.key]}/10 - {getSkillLabel(skills[field.key])}
                      </div>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={skills[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #ef4444 0%, #f97316 20%, #eab308 50%, #22c55e 80%, #8b5cf6 100%)`
                      }}
                    />
                    
                    {/* Number input */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Điểm chính xác:</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={skills[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skill Summary */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
              <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                📊 Tổng Quan Kỹ Năng
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {Object.values(skills).reduce((sum, val) => sum + val, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Tổng điểm</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(Object.values(skills).reduce((sum, val) => sum + val, 0) / SKILL_FIELDS.length).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Điểm trung bình</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.values(skills).filter(val => val >= 7).length}
                  </div>
                  <div className="text-sm text-gray-600">Kỹ năng mạnh</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Object.values(skills).filter(val => val <= 3).length}
                  </div>
                  <div className="text-sm text-gray-600">Cần cải thiện</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {showCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-w-[200px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    {submitText}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
