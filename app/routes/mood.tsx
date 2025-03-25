import { Link } from "@remix-run/react"; //导入remixlink组件，用于导肮
import { Button } from "~/components/ui/button"; //导入按钮组件
import { useState } from "react"; //useState 用于处理组件的状态（如 selectedMood 和 intensity）
import { Home, ArrowLeft } from "lucide-react"; //导入图标库
import { Slider } from "~/components/ui/slider"; //导入滑块组件

//定义mood组件
export default function Mood() {
    const [selectedMood, setSelectedMood] = useState<"happy" | "sad">("happy"); // 默认选择为 happy
    const [moodIntensity, setMoodIntensity] = useState(50); //情绪强度，范围0-100，默认50
    const [stateIntensity, setStateIntensity] = useState(50); //状态强度，范围0-100，默认50
    const [selectedState, setSelectedState] = useState<"light" | "dark">("light"); // 默认选择为 light
    const [speedIntensity, setSpeedIntensity] = useState(50); //速度强度，范围0-100，默认50
    const [selectedSpeed, setSelectedSpeed] = useState<"fast" | "slow">("fast"); // 默认选择为 fast

    // 预定义颜色类
    const colorClasses = {
        happy: {
            low: "from-yellow-300 via-orange-400 to-red-400",
            medium: "from-yellow-400 via-orange-500 to-red-500",
            high: "from-yellow-500 via-orange-600 to-red-600",
        },
        sad: {
            low: "from-blue-300 via-indigo-400 to-purple-400",
            medium: "from-blue-400 via-indigo-500 to-purple-500",
            high: "from-blue-500 via-indigo-600 to-purple-600",
        },
    };

    // 根据强度获取卡片的背景色
    const getCardBackgroundClass = () => {
        if (!selectedMood) return "";
        if (moodIntensity < 33) {
            return colorClasses[selectedMood].low;
        } else if (moodIntensity < 66) {
            return colorClasses[selectedMood].medium;
        } else {
            return colorClasses[selectedMood].high;
        }
    };

    //设置背景渐变色
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-500">
            {/* Navigation Bar */}
            <nav className="bg-black/20 backdrop-blur-lg">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Back
                        </Button>
                    </div>
                    <Link to="/dashboard">
                        <Button variant="ghost" className="text-white hover:bg-white/20">
                            <Home className="h-5 w-5 mr-2" />
                            Dashboard
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-8">
                        <h1 className="text-3xl font-bold mb-6 text-white">Choose Your Mood</h1>

                        {/* Mood Selection */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-white mb-4">Select Mood Intensity</h2>
                            <div className="flex justify-between">
                                <Button
                                    onClick={() => { setSelectedMood("happy"); setMoodIntensity(50); }}
                                    className={`flex-none mx-1 ${selectedMood === "happy" ? "bg-[#1DB954] text-white" : "bg-gray-500 text-white"} text-xs hover:bg-[#1ed760]`}
                                >
                                    Happy
                                </Button>
                                <Button
                                    onClick={() => { setSelectedMood("sad"); setMoodIntensity(50); }}
                                    className={`flex-none mx-1 ${selectedMood === "sad" ? "bg-[#1DB954] text-white" : "bg-gray-500 text-white"} text-xs hover:bg-[#1ed760]`}
                                >
                                    Sad
                                </Button>
                            </div>
                            <div className="max-w-md mx-auto mb-4">
                                <Slider
                                    value={[moodIntensity]}
                                    onValueChange={(values) => setMoodIntensity(values[0])}
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="w-full max-w-md"
                                    trackClassName="bg-white/10 h-2"
                                    activeTrackClassName="bg-[#1DB954]"
                                    thumbClassName="h-4 w-4 border-2 border-[#1DB954] bg-white"
                                />
                                <div className="text-center text-white/60 mt-2">
                                    {moodIntensity}% {selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)} Intensity
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <hr className="w-1/2 my-6 border-white/10" />
                        </div>

                        {/* State Selection */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-white mb-4">Select Music Style</h2>
                            <div className="flex justify-between">
                                <Button
                                    onClick={() => { setSelectedState("light"); setStateIntensity(50); }}
                                    className={`flex-none mx-1 ${selectedState === "light" ? "bg-[#1DB954] text-white" : "bg-gray-500 text-white"} text-xs hover:bg-[#1ed760]`}
                                >
                                    Light
                                </Button>
                                <Button
                                    onClick={() => { setSelectedState("dark"); setStateIntensity(50);}}
                                    className={`flex-none mx-1 ${selectedState === "dark" ? "bg-[#1DB954] text-white" : "bg-gray-500 text-white"} text-xs hover:bg-[#1ed760]`}
                                >
                                    Dark
                                </Button>
                            </div>
                            <div className="max-w-md mx-auto mb-4">
                                <Slider
                                    value={[stateIntensity]}
                                    onValueChange={(values) => setStateIntensity(values[0])}
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="w-full max-w-md"
                                    trackClassName="bg-white/10 h-2"
                                    activeTrackClassName="bg-[#1DB954]"
                                    thumbClassName="h-4 w-4 border-2 border-[#1DB954] bg-white"
                                />
                                <div className="text-center text-white/60 mt-2">
                                    {stateIntensity}% {selectedState.charAt(0).toUpperCase() + selectedState.slice(1)} Intensity
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <hr className="w-1/2 my-6 border-white/10" />
                        </div>

                        {/* Speed Selection */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-white mb-4">Select Musical Rhythm</h2>
                            <div className="flex justify-between">
                                <Button
                                    onClick={() => { setSelectedSpeed("fast"); setSpeedIntensity(50); }}
                                    className={`flex-none mx-1 ${selectedSpeed === "fast" ? "bg-[#1DB954] text-white" : "bg-gray-500 text-white"} text-xs hover:bg-[#1ed760]`}
                                >
                                    Fast
                                </Button>
                                <Button
                                    onClick={() => { setSelectedSpeed("slow"); setSpeedIntensity(50); }}
                                    className={`flex-none mx-1 ${selectedSpeed === "slow" ? "bg-[#1DB954] text-white" : "bg-gray-500 text-white"} text-xs hover:bg-[#1ed760]`}
                                >
                                    Slow
                                </Button>
                            </div>
                            <div className="max-w-md mx-auto mb-4">
                                <Slider
                                    value={[speedIntensity]}
                                    onValueChange={(values) => setSpeedIntensity(values[0])}
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="w-full max-w-md"
                                    trackClassName="bg-white/10 h-2"
                                    activeTrackClassName="bg-[#1DB954]"
                                    thumbClassName="h-4 w-4 border-2 border-[#1DB954] bg-white"
                                />
                                <div className="text-center text-white/60 mt-2">
                                    {speedIntensity}% {selectedSpeed.charAt(0).toUpperCase() + selectedSpeed.slice(1)} Intensity
                                </div>
                            </div>
                        </div>

                        <Link
                            to={`/emotion/${selectedMood}?moodIntensity=${moodIntensity}&state=${selectedState}&speed=${selectedSpeed}&stateIntensity=${stateIntensity}&speedIntensity=${speedIntensity}`}
                            className="block w-full transform transition-all duration-500"
                        >
                            <Button className="w-full text-white text-lg py-6 bg-[#1DB954] hover:bg-[#1ed760] font-semibold">
                                Find Music
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
